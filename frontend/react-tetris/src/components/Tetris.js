import React, { useState } from 'react';

import { createStage, checkCollision } from '../gameHelpers';

// Styled Components
import { StyledTetrisWrapper, StyledTetris} from './styles/StyledTetris';

// Custom Hooks
import { useInterval } from '../hooks/useInterval';
import { usePlayer } from '../hooks/usePlayer';
import { useStage } from '../hooks/useStage';
import { useGameStatus } from '../hooks/useGameStatus';

// Components
import Stage from './Stage';
import Display from './Display';
import StartButton from './StartButton';

let highscore = 0; // global variable to store high score from DynamoDB
let gotScore = false;

// Outside method to set global highscore variable
const setHighScore = (score) => {
    if (!gotScore) {
        highscore = score;
        gotScore = true;
    }
}

const Tetris = () => {

    const [dropTime, setDropTime] = useState(null);
    const [gameOver, setGameOver] = useState(false);

    const [player, updatePlayerPos, resetPlayer, playerRotate] = usePlayer();
    const [stage, setStage, rowsCleared] = useStage(player, resetPlayer);
    const [score, setScore, rows, setRows, level, setLevel] = useGameStatus(rowsCleared);

    // Method to call AWS API Gateway and request high score
    const getRequest = () => {
        fetch('https://zzowdgzta6.execute-api.ap-southeast-2.amazonaws.com/Prod/get-hs')
            .then(response => {
                const responseJson = response.json()
                return responseJson;
            }).then(data => {
                // const score = data.message.Item.score.N;
                const score = data.message;
                console.log("HIGH SCORE: " + score);
                setHighScore(score);
                return score;
            })        
    }
    
    // Method to post high score to AWS API Gateway
    const postRequest = (playerScore) => {
        if (gameOver) {
            console.log('GAME OVER');
            fetch('https://zzowdgzta6.execute-api.ap-southeast-2.amazonaws.com/Prod/update-hs', {
                method: 'POST',
                header: {
                    'Access-Control-Allow-Origin': '*'
                },
                body: JSON.stringify({
                    score: playerScore
                })
            })
        }
    }

    //
    if (!gotScore) {
        getRequest();
    }
    if (gameOver) {
        postRequest(score); // !
    }
    if (score > highscore) {
        highscore = score;
    }
    //

    console.log('re-render');

    const movePlayer = dir => {
        if (!checkCollision(player, stage, { x: dir, y: 0 })) {
            updatePlayerPos({ x: dir, y: 0});
        }
    }

    const startGame = () => {
        // Reset everything
        setStage(createStage());
        setDropTime(1000);
        resetPlayer();
        setGameOver(false);
        setScore(0);
        setRows(0);
        setLevel(0);
    }

    const drop = () => {
        // Increase level when player has cleared 10 rows
        if (rows > (level + 1) * 10) {
            setLevel(prev => prev + 1);
            // Also increase speed
            setDropTime(1000 / (level + 1) + 200);
        }

        if (!checkCollision(player, stage, { x: 0, y: 1})) {
            updatePlayerPos({ x: 0, y: 1, collided: false})
        } else {
            // Game Over
            if (player.pos.y < 1) {
                console.log("GAME OVER!!!");
                setGameOver(true);
                setDropTime(null);
            }
            updatePlayerPos({ x: 0, y: 0, collided: true });
        }        
    }

    const keyUp = ({ keyCode })  => {
        if (!gameOver) {
            if (keyCode === 40) {
                console.log("interval on")
                setDropTime(1000 / (level + 1) + 200);
            }
        }
    }

    const dropPlayer = () => {
        console.log("interval off");
        setDropTime(null);
        drop();
    }

    const move = ({ keyCode }) => {
        if (!gameOver) {
            if (keyCode === 37) { // Left Arrow
                movePlayer(-1);
            } else if (keyCode === 39) { // Right Arrow
                movePlayer(1);
            } else if (keyCode === 40) { // Down Arrow
                dropPlayer();
            } else if (keyCode === 38) { // Up Arrow
                playerRotate(stage, 1);
            }
        }
    }
    
    useInterval(() => {
        drop();
    }, dropTime)

    return (
        <StyledTetrisWrapper 
            role="button" 
            tabIndex="0" 
            onKeyDown={e => move(e)} 
            onKeyUp={keyUp}
        >
            <StyledTetris>
                <Stage stage={stage} />
                <aside>
                    {gameOver ? (
                        <Display gameOver={gameOver} text="Game Over" />
                    ) : (
                        <div>
                            <Display text={`Score: ${score}`} />
                            <Display text={`Rows: ${rows}`} />
                            <Display text={`Level: ${level}`} />
                        </div>
                    )}
                    <Display text={`High Score: ${highscore}`} /> {/* High score in DynamoDB */}
                    <StartButton callback={startGame} />
                </aside>
            </StyledTetris>
        </StyledTetrisWrapper>
    );
};

export default Tetris;
