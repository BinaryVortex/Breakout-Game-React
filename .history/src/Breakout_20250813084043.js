import React, { useRef, useEffect, useState } from "react"
import "./Breakout.sass"

const CANVAS_WIDTH = 650
const CANVAS_HEIGHT = 450
const BALL_RADIUS = 9
const PADDLE_HEIGHT = 12
const PADDLE_WIDTH = 72
const ROW_COUNT = 5
const COLUMN_COUNT = 9
const BRICK_WIDTH = 54
const BRICK_HEIGHT = 18
const BRICK_PADDING = 12
const TOP_OFFSET = 40
const LEFT_OFFSET = 33

function getInitialBricks() {
  const bricks = []
  for (let c = 0; c < COLUMN_COUNT; c++) {
    bricks[c] = []
    for (let r = 0; r < ROW_COUNT; r++) {
      bricks[c][r] = { x: 0, y: 0, status: 1 }
    }
  }
  return bricks
}

function Breakout() {
  const canvasRef = useRef(null)

  const [ball, setBall] = useState({
    x: CANVAS_WIDTH / (Math.floor(Math.random() * Math.random() * 10) + 3),
    y: CANVAS_HEIGHT - 40,
    dx: 2,
    dy: -2
  })

  const [paddleX, setPaddleX] = useState((CANVAS_WIDTH - PADDLE_WIDTH) / 2)
  const [bricks, setBricks] = useState(getInitialBricks())
  const [score, setScore] = useState(0)
  const [gameStatus, setGameStatus] = useState("")

  useEffect(() => {
    function mouseMoveHandler(e) {
      const canvas = canvasRef.current
      const rect = canvas.getBoundingClientRect()
      const relativeX = e.clientX - rect.left
      if (relativeX > 0 && relativeX < CANVAS_WIDTH) {
        setPaddleX(relativeX - PADDLE_WIDTH / 2)
      }
    }
    window.addEventListener("mousemove", mouseMoveHandler)
    return () => window.removeEventListener("mousemove", mouseMoveHandler)
  }, [])

  useEffect(() => {
    if (gameStatus) return

    const ctx = canvasRef.current.getContext("2d")
    let animationFrameId

    function drawPaddle() {
      ctx.beginPath()
      if (ctx.roundRect)
        ctx.roundRect(paddleX, CANVAS_HEIGHT - PADDLE_HEIGHT, PADDLE_WIDTH, PADDLE_HEIGHT, 30)
      else
        ctx.rect(paddleX, CANVAS_HEIGHT - PADDLE_HEIGHT, PADDLE_WIDTH, PADDLE_HEIGHT)
      ctx.fillStyle = "#333"
      ctx.fill()
      ctx.closePath()
    }

    function drawBall() {
      ctx.beginPath()
      ctx.arc(ball.x, ball.y, BALL_RADIUS, 0, Math.PI * 2)
      ctx.fillStyle = "#333"
      ctx.fill()
      ctx.closePath()
    }

    function drawBricks() {
      for (let c = 0; c < COLUMN_COUNT; c++) {
        for (let r = 0; r < ROW_COUNT; r++) {
          if (bricks[c][r].status === 1) {
            const brickX = c * (BRICK_WIDTH + BRICK_PADDING) + LEFT_OFFSET
            const brickY = r * (BRICK_HEIGHT + BRICK_PADDING) + TOP_OFFSET
            bricks[c][r].x = brickX
            bricks[c][r].y = brickY
            ctx.beginPath()
            if (ctx.roundRect)
              ctx.roundRect(brickX, brickY, BRICK_WIDTH, BRICK_HEIGHT, 30)
            else
              ctx.rect(brickX, brickY, BRICK_WIDTH, BRICK_HEIGHT)
            ctx.fillStyle = "#333"
            ctx.fill()
            ctx.closePath()
          }
        }
      }
    }

    function trackScore() {
      ctx.font = "bold 16px sans-serif"
      ctx.fillStyle = "#333"
      ctx.fillText("Score : " + score, 8, 24)
    }

    function hitDetection() {
      let newBricks = bricks.map((col) => col.map((brick) => ({ ...brick })))
      let didHit = false
      for (let c = 0; c < COLUMN_COUNT; c++) {
        for (let r = 0; r < ROW_COUNT; r++) {
          let b = newBricks[c][r]
          if (b.status === 1) {
            if (
              ball.x > b.x &&
              ball.x < b.x + BRICK_WIDTH &&
              ball.y > b.y &&
              ball.y < b.y + BRICK_HEIGHT
            ) {
              ball.dy = -ball.dy
              b.status = 0
              setScore((s) => s + 1)
              didHit = true
              if (score + 1 === ROW_COUNT * COLUMN_COUNT) setGameStatus("win")
            }
          }
        }
      }
      if (didHit) setBricks(newBricks)
    }

    function draw() {
      ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT)
      trackScore()
      drawBricks()
      drawBall()
      drawPaddle()
      hitDetection()

      let { x, y, dx, dy } = ball
      if (x + dx > CANVAS_WIDTH - BALL_RADIUS || x + dx < BALL_RADIUS) {
        dx = -dx
      }
      if (y + dy < BALL_RADIUS) {
        dy = -dy
      } else if (y + dy > CANVAS_HEIGHT - BALL_RADIUS) {
        if (x > paddleX && x < paddleX + PADDLE_WIDTH) {
          dy = -dy
        } else {
          setGameStatus("lose")
        }
      }
      x += dx
      y += dy
      setBall({ x, y, dx, dy })
    }

    animationFrameId = setTimeout(() => {
      draw()
    }, 10)

    return () => clearTimeout(animationFrameId)
    // eslint-disable-next-line
  }, [ball, bricks, paddleX, score, gameStatus])

  function handleRestart() {
    setBall({
      x: CANVAS_WIDTH / (Math.floor(Math.random() * Math.random() * 10) + 3),
      y: CANVAS_HEIGHT - 40,
      dx: 2,
      dy: -2
    })
    setPaddleX((CANVAS_WIDTH - PADDLE_WIDTH) / 2)
    setBricks(getInitialBricks())
    setScore(0)
    setGameStatus("")
  }

  return (
    <div className="breakout-wrapper">
      <canvas
        ref={canvasRef}
        id="breakout-canvas"
        width={CANVAS_WIDTH}
        height={CANVAS_HEIGHT}
        tabIndex={0}
      />
      <div className="score">Score: {score}</div>
      {gameStatus === "win" && (
        <div className="message win">
          You Win!
          <button onClick={handleRestart}>Restart</button>
        </div>
      )}
      {gameStatus === "lose" && (
        <div className="message lose">
          Game Over!
          <button onClick={handleRestart}>Restart</button>
        </div>
      )}
    </div>
  )
}

export default Breakout