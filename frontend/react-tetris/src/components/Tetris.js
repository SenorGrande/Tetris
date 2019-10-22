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

let test = 0;
let highscore = 0;

const testing = (score) => {
    if (test === 0) {
        console.log("HIYAA: " + score);
        test = score;
    }
}

const Tetris = () => {
    
    let response = "";

    const [dropTime, setDropTime] = useState(null);
    const [gameOver, setGameOver] = useState(false);

    const [player, updatePlayerPos, resetPlayer, playerRotate] = usePlayer();
    const [stage, setStage, rowsCleared] = useStage(player, resetPlayer);
    const [score, setScore, rows, setRows, level, setLevel] = useGameStatus(rowsCleared);

    const getRequest = () => {
        fetch('https://38z2mz0xi8.execute-api.ap-southeast-2.amazonaws.com/Prod/get-hs')
            .then(response => {
                const responseJson = response.json()
                // console.log(responseJson);
                return responseJson;
            }).then(data => {
                const score = data.message.Item.score.N;
                // console.log(score);
                // this.setState({highscore: score});
                // test = score;
                console.log("SCORE: " + score);
                testing(score);
                return score;
            })

        // const response = await fetchResult;
        // const jsonData = await response.json();
        // // console.log(jsonData);
        // // test = jsonData.message.Item.score.N
        // return jsonData.message.Item.score.N;
        
    }
    
    const postRequest = (playerScore) => {
        if (gameOver) {
            console.log('GAME OVER');
            fetch('https://38z2mz0xi8.execute-api.ap-southeast-2.amazonaws.com/Prod/update-hs', {
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

    if (test === 0 && highscore === 0) {
        getRequest();
    }
    postRequest(score);
    console.log(highscore);

    // const getHighScore = () => {
    //     response = getRequest();
    //     // let highscore = response;
    //     // let highscore = test;
    //     console.log("--- START RESPONSE ---");
    //     console.log(response);
    //     console.log("--- END RESPONSE ---");
    //     return [highscore];
    // }
    // const [highscore] = getHighScore();
    // const [highscore] = getRequest();

    // console.log(test());
    // console.log(posttest());

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
        console.log("TESTING: " + parseInt(test));
        highscore = test;
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
            } else if (keyCode === 38) {
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
                            {/* Add High score */}
                        </div>
                    )}
                    {/* Add High score */}
                    <Display text={`High Score: ${highscore}`} />
                    <StartButton callback={startGame} />
                </aside>
            </StyledTetris>
        </StyledTetrisWrapper>
    );
};

export default Tetris;
