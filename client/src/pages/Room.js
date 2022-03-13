/* eslint-disable jsx-a11y/anchor-is-valid */
import './Room.css';


import React, { useEffect, useState, useRef }  from 'react';
import { useParams, Navigate } from 'react-router-dom';
import { SocketManager } from '../api';
import { Button, Dropdown } from 'react-bootstrap';
import { Rnd } from 'react-rnd';
import ToggleSwitch from './ToggleSwitch';
import CountdownTimer from './CountdownTimer';
import { Table, Modal } from 'react-bootstrap';
import Pdf from 'react-pdf-js';

let socket = new SocketManager();
let timer = new CountdownTimer();

const noop = ( () => {} );

function TeamsDisplay({ teams, isMod, isBonus }) {
    function mapPlayers(players) {
        return players.map((player, i) => {
            return (
                <li key={i}>
                    <span className={player.joined ? "player-name joined" : "player-name away"}>{player.fullName}</span>
                    {player.buzzing && <span className="dot"></span>}
                </li>
            );
        });
    }
    let teamAPlayers = teams[0] ? mapPlayers(teams[0].members) : null;
    let teamBPlayers = teams[1] ? mapPlayers(teams[1].members) : null;
    return (
        <div className="TeamsDisplay">
            <div className="panel panel-left">
                <h3 className="score-header">{teams[0] ? teams[0].score : 'N/A'}</h3>
                {isMod && <ToggleSwitch
                    label="first"
                    onChange={e => socket.setLocked(0, e.target.checked)}
                    checked={isBonus || (teams[0] ? teams[0].lockedOut : false)}
                    disabled={isBonus}
                    />}
                <h5>{teams[0] ? teams[0].name : 'Team A'}</h5>
                <hr></hr>
                <ul className="players-list">
                    {teamAPlayers}
                </ul>
            </div>
            <div className="panel panel-right">
            <h3 className="score-header">{teams[1] ? teams[1].score : 'N/A'}</h3>
                {isMod && <ToggleSwitch
                    label="second"
                    onChange={e => socket.setLocked(1, e.target.checked)}
                    checked={isBonus || (teams[1] ? teams[1].lockedOut : false)}
                    disabled={isBonus}
                    />}
                <h5>{teams[1] ? teams[1].name : 'Team B'}</h5>
                <hr></hr>
                <ul className="players-list">
                    {teamBPlayers}
                </ul>
            </div>
        </div>
    );
}

function BuzzComponent({ displayActive, movable }) {

    const [isDragging, setIsDragging] = useState(false);

    const eventControl = (event, info) => {


        if (event.type === 'mousemove' || event.type === 'touchmove') {
        setIsDragging(true)
        }

        if (event.type === 'mouseup' || event.type === 'touchend') {
        setTimeout(() => {
            setIsDragging(false);
        }, 100);

        }
    }
    let content = (
        <div className="BuzzComponent">
            <button className={`buzzer ${displayActive ? "buzzer-active" : "buzzer-inactive"}`} onClick={displayActive ? (() => (isDragging ? noop() : socket.buzz())) : noop}>
            </button>
        </div>
    );
    if (movable) {
        return (
            <div className="BuzzComponentHolder">
                <Rnd
                default={{
                    x: 150,
                    y: 150,
                    width: 300,
                    height: 300
                }}
                dragAxis="both"
                bounds="window"
                lockAspectRatio
                onDrag={eventControl}
                onDragStop={eventControl}
                >
                    {content}
            </Rnd>
            </div>
        )
    } else {
        return (
            <div className="BuzzComponentImmobile">
                {content}
            </div>
        );
    }
}

function BuzzerName({ buzzer, user }) {
    let res = null;
    if (buzzer) {
        if (buzzer.googleId === user.googleId) {
            res = <h1><span className="buzzer-name">You</span> buzzed!</h1>
        } else {
            res = <h1><span className="buzzer-name">{buzzer.fullName}</span> buzzed!</h1>
        }
    }
    return (
        <div className="BuzzerName">
            {res}
        </div>
    )
}

function QuestionInfo({ questionNum, isBonus, isMod }) {
    questionNum += 1; // zero-indexed on server
    function setQuestionNum(e) {
        let next = e.target.value;
        if (next !== '') {
            socket.setQuestionNum(next - 1); // zero-indexed on server
        }
    }
    return (
        <Rnd
        default={{
            x: 224,
            y: 70
        }}
        onDragStop={(e) => console.log('Question info', e)}>
        <div className="text-center QuestionInfo">
            <h3>Question {isMod ? <input type="number" value={questionNum} onChange={setQuestionNum} className="question-num-input"/> : <span>{questionNum}</span>}</h3>
            <ul className="nav nav-tabs justify-content-center nav-justified tu-bonus-tabs">
                <li className="nav-item tu-bonus-select">
                    <a className={`nav-link ${isBonus ? "" : "active"}`} href="#" onClick={isMod ? () => socket.setOnBonus(false) : noop}>Toss-Up</a>
                </li>
                <li className="nav-item">
                    <a className={`nav-link ${isBonus ? "active" : ""}`} href="#" onClick={isMod ? () => socket.setOnBonus(true) : noop}>Bonus</a>
                </li>
            </ul>
        </div>
        </Rnd>
    );
}

function ModBuzzManager({ buzzActive, isBonus, answeringTeam }) {
    let content = null;
    if (buzzActive || (answeringTeam && isBonus)) {
        content = (
            <div>
                {buzzActive ? <h6 className="handle">Buzz: {buzzActive.fullName}</h6> : <h6 className="handle">Bonus {answeringTeam ? `for ${answeringTeam.name}`: ''}</h6>}
                <hr/>
                <div className="correctness-buttons">
                    <Button variant="success" onClick={() => socket.correctAnswer()}>Correct</Button>
                    <Button variant="warning" onClick={() => socket.incorrectAnswer()}>Incorrect</Button>
                    {buzzActive && <Button variant="danger" onClick={() => socket.negAnswer()}>Neg</Button>}
                    {buzzActive && <Button variant="secondary" onClick={() => socket.ignoreBuzz()}>Ignore</Button>}
                </div>
            </div>
        );
    } else {
        content = <p className="handle">No one is buzzing in.</p>
    }
    return (
        <Rnd
            default={{
                x: 830,
                y: 356
            }}
            bounds="window"
            minWidth={110}
        >
            <div className="mod-buzz-content">
                {content}
            </div>
        </Rnd>
    )
}

function shouldBuzzShowActive(gameState, teamIndex) {
    return !gameState.buzzActive && !gameState.teams[teamIndex].lockedOut && !gameState.onBonus;
}

function TimerMan({ isBonus, isMod, timeUp }) {
    let shouldTime = (isBonus ? 22 : 7);
    const [time, setTime] = useState(timer.active() ? timer.remainingTime : shouldTime);
    const [reload, setReload] = useState(0);
    if (!timer.active() && time !== shouldTime) {
        setTime(shouldTime);
    }
    useEffect(() => {
        timer.setSecondCallback(duration => {
            setTime(duration);
            setReload(reload + 1); // just forces a component reload to get rid of the start timer button asap
        });
        return function() {
            timer.secondCallback = null;
        };
    }, [reload]);
    let ourTime = time;
    if (timeUp) {
        ourTime = 0;
    }
    let defaultPosition = {
        x: 800,
        y: 40
    };
    if (!isMod) {
        defaultPosition = {
            x: 700,
            y: 200
        };
    }
    return (
        <Rnd
        default={defaultPosition}>
        <div className="TimerMan">
            <h1 className={`timer-text ${timeUp ? 'time-up' : ''}`}>
                {(time !== null) ? `00:${ourTime.toString().padStart(2, '0')}` : null}
            </h1>
            {(isMod && !timer.active() && !timeUp) && (
                <Button size="lg" variant="primary" className="startTimerBtn" onClick={() => socket.startTimer()}>Start Timer</Button>
            )}
            {(isMod && timer.active() && !timeUp) && (
                <Button variant="danger" className="stopTimerBtn" onClick={() => socket.cancelTimer()}>Stop Timer</Button>
            )}
            {(isMod && timeUp) && (
                <Button variant="success" className="nextQuestionBtn" onClick={() => socket.nextQuestion()}>Next Question</Button>
            )}
        </div>
        </Rnd>
    );
}

function ScoreboardComponent({ scoreboard, questionNum, teamNames, isMod }) {

    const [show, setShow] = useState(false);
    const [offsetModal, setOffsetModal] = useState(null);
    const offsetAmountInput = useRef(null);

    let running = [0, 0];

    function toggleTableVal(qn, teamInd, i) {
        if (teamInd === 1) {
            i = 3 - i;
        }
        let scores = scoreboard[qn];
        if (i === 0) {
            // Penalty
            let oppInd = (teamInd === 0) ? 1 : 0;
            if (scores[oppInd].length > 0 && scores[oppInd][0] === -1) {
                // Was a neg previously, let's set it to just incorrect
                socket.setIncorrect(qn, oppInd, false);
            } else {
                socket.setNeg(qn, oppInd);
            }
        } else if (i === 1) {
            if (scores[teamInd].length > 0 && scores[teamInd][0] !== 1) {
                socket.setCorrect(qn, teamInd, false);
            } else if (scores[teamInd].length === 0) {
                socket.setIncorrect(qn, teamInd, false);
            } else {
                socket.setNoBuzz(qn, teamInd);
            }
        } else if (i === 2) {
            if (scores[teamInd].length > 1 && scores[teamInd][1] !== 1) {
                socket.setCorrect(qn, teamInd, true);
            } else {
                socket.setIncorrect(qn, teamInd, true);
            }
        } else {
            console.error('Not sure which value is supposed to be toggled.');
        }
    }

    function genTeamRow(currQN, arr, ind, reverse) {
        let opp_ind = (ind === 0 ? 1 : 0);
        let vals = arr[ind];
        let res = [];
        let sub = 0;
        let pen = (arr[opp_ind].length > 0 && arr[opp_ind][0] === -1);
        let penVal = pen ? 4 : 0;
        let penStr = pen ? '4' : '-';
        if (vals.length === 0) {
            sub = penVal;
            res = [penStr, '-', '-', sub];
        } else if (vals.length === 1) {
            let val = Math.max(vals[0], 0);
            sub = penVal + val * 4;
            res = [penStr, val * 4, '-', sub];
        } else if (vals.length === 2) {
            sub = penVal + vals[0] * 4 + vals[1] * 10;
            res = [penStr, vals[0] * 4, vals[1] * 10, sub];
        } else {
            console.error('Warning: scoreboard doesn\'t have the right number of elements');
        }
        if (reverse) {
            res = res.reverse();
        }
        let elems = res.map((s, i) => {
            let inner = s;
            let clickable = isMod && ( (ind === 0 && i !== 3) || (ind === 1 && i !== 0) );
            if (clickable) {
                inner = <a className="toggle-scoreboard" >{s}</a>
            }
            return <td className={clickable ? 'toggle-scoreboard' : ''} onClick={clickable ? () => toggleTableVal(currQN, ind, i) : noop} key={`${currQN}-${ind}-${i}`}>{inner}</td>
        });
        return [elems, sub];
    }

    let currQN = 0;

    function genSR(arr) {
        let [team1, t1s] = genTeamRow(currQN, arr, 0, false);
        let [team2, t2s] = genTeamRow(currQN, arr, 1, true);
        running[0] += t1s;
        running[1] += t2s;
        let res = (
            <tr key={`${currQN}-top`} className="scoreboard-row">
                <td className={currQN === questionNum ? "bg-primary" : ""} key={`${currQN}-qn`}>{currQN+1}</td>
                {team1}
                <td></td>
                {team2}
            </tr>
        );
        currQN++;
        return res;
    }

    let numOnFirstPage = Math.ceil(scoreboard.length / 2);
    let firstHalf = scoreboard.slice(0, numOnFirstPage);
    let secondHalf = scoreboard.slice(numOnFirstPage, scoreboard.length);

    firstHalf = firstHalf.map(genSR);
    secondHalf = secondHalf.map(genSR);

    let table = (
        <Table striped bordered hover className="table-left">
            <thead>
                <tr>
                    <th></th>
                    <th className="scoreboard-team-name" colSpan={4}>
                        {teamNames[0]}
                        {isMod && <span className="bi bi-info-circle show-offset-button" onClick={() => setOffsetModal({ teamInd: 0 })}></span>}
                    </th>
                    <th></th>
                    <th className="scoreboard-team-name" colSpan={4}>
                        {teamNames[1]}
                        {isMod && <span className="bi bi-info-circle show-offset-button" onClick={() => setOffsetModal({ teamInd: 1 })}></span>}
                    </th>
                </tr>
                <tr>
                    <th>#</th>
                    <th>Pen.</th>
                    <th>TU</th>
                    <th>B</th>
                    <th>Sub</th>
                    <th></th>
                    <th>Sub</th>
                    <th>B</th>
                    <th>TU</th>
                    <th>Pen.</th>
                </tr>
            </thead>
            <tbody>
                {firstHalf}
            </tbody>
        </Table>
    );
    let table2 = (
        <Table striped bordered hover className="table-right">
            <thead>
            <tr>
                    <th></th>
                    <th className="scoreboard-team-name" colSpan={4}>
                        {teamNames[0]}
                        {isMod && <span className="bi bi-info-circle show-offset-button" onClick={() => setOffsetModal({ teamInd: 0 })}></span>}
                    </th>
                    <th></th>
                    <th className="scoreboard-team-name" colSpan={4}>
                        {teamNames[1]}
                        {isMod && <span className="bi bi-info-circle show-offset-button" onClick={() => setOffsetModal({ teamInd: 1 })}></span>}
                    </th>
                </tr>
                <tr>
                    <th>#</th>
                    <th>Pen.</th>
                    <th>TU</th>
                    <th>B</th>
                    <th>Sub</th>
                    <th></th>
                    <th>Sub</th>
                    <th>B</th>
                    <th>TU</th>
                    <th>Pen.</th>
                </tr>
            </thead>
            <tbody>
                {secondHalf}
            </tbody>
        </Table>
    );

    function setOffsetAmount() {
        let amount = parseInt(offsetAmountInput.current.value);
        socket.setOffset(offsetModal.teamInd, amount);
        setOffsetModal(null);
    }

    let content = (
        <div className={`ScoreboardInner ${show ? 'border-scoreboard' : ''}`}>
            <Dropdown>
                <Dropdown.Toggle style={{width: '100%'}} className="showHidePanel" onClick={() => setShow(!show)}>Scoreboard</Dropdown.Toggle>
            </Dropdown>
            <Modal show={offsetModal !== null} onHide={ () => setOffsetModal(null) }>
                <Modal.Header closeButton>
                    <Modal.Title>Set Score Offset for {offsetModal ? teamNames[offsetModal.teamInd] : ''}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <label>Offset: <input ref={offsetAmountInput} type="number" autoFocus /></label>
                    <p>This is used to offset the score of this team by an arbitrary amount (e.g. catching up to a previous score).</p>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={ () => setOffsetModal(null) }>Close</Button>
                    <Button variant="primary" onClick={setOffsetAmount}>Confirm</Button>
                </Modal.Footer>
            </Modal>
            {show && (
                <div className="tables-holder">
                    {table}
                    {table2}
                </div>
            )}
        </div>
    );

    return (
        
        <div className="ScoreboardComponent">
            {content}
        </div>
    );

}

function ScrollableDiv({ className, handleScroll, scrollTop, children }) {
    const ref = useRef(null);

    function onScroll() {
        console.log('scroll');
        handleScroll(ref.current.scrollTop);
    }
    if (ref.current) {
        ref.current.scrollTop = scrollTop;
    }

    return (
        <div ref={ref} onScroll={onScroll} className={className}>
            {children}
        </div>
    );
}

function PacketComponent({ url, roundNum, questionNum, hasBuzz }) {
    const [offset, setOffset] = useState(0);
    const [scroll, setScroll] = useState(0);
    const [manualShow, setManualShow] = useState(false);

    useEffect(() => {
        if (hasBuzz) {
            let timeout = setTimeout(() => {
                setManualShow(true);
            }, 2000); // auto-show after 2s
            return function() {
                clearTimeout(timeout);
            };
        }
    }, [hasBuzz]);

    if (!hasBuzz && manualShow) {
        setManualShow(false);
    }

    let showPacket = (manualShow || !hasBuzz);
    let page = Math.max(offset + questionNum + 1, 1);
    
    return (
        <div className="PacketComponent">
            <div className="packet-controls-holder">
                <p>Round {roundNum}</p>
                <div className="packet-controls">
                    <a className="hoverclick" onClick={() => {
                        if (page > 1) {
                            setScroll(0);
                            setOffset(offset - 1);
                        }
                    }}>
                        <span className="bi-chevron-left"></span>
                    </a>
                    <a className="hoverclick" onClick={() => {
                        setScroll(0);
                        setOffset(offset + 1);
                    }}>
                        <span className="bi-chevron-right"></span>
                    </a>
                </div>
            </div>
            <ScrollableDiv className={`pdf-holder ${showPacket ? 'pdf-holder-active' : 'pdf-holder-inactive'}`} handleScroll={setScroll} scrollTop={scroll}>
                <div className={showPacket ? '' : 'invisible'}>
                    <Pdf file={url} page={page} scale={1} withCredentials />
                </div>
                {!showPacket && (
                    <div className="text-center">
                        <h3>Buzz!</h3>
                        <Button variant="primary" onClick={() => setManualShow(true)}>Show Packet</Button>
                    </div>
                )}
            </ScrollableDiv>
        </div>
    )
}

function EndGameComponent() {
    const [showEndGameModal, setShowEndGameModal] = useState(false);
    return (
        <div className="EndGameComponent">
            <Modal show={showEndGameModal} onHide={ () => setShowEndGameModal(false) }>
                <Modal.Header closeButton>
                    <Modal.Title>End Game</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    Are you sure you'd like to end this game and finalize the results?  This cannot be undone.
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={ () => setShowEndGameModal(false) }>Close</Button>
                    <Button variant="primary" onClick={() => socket.endGame()}>Confirm</Button>
                </Modal.Footer>
            </Modal>
            <Button variant="danger" className="end-game-button" onClick={() => setShowEndGameModal(true)}>End Game</Button>
        </div>
    );
}

function ModUI({ gameState, room, user }) {
    // Panel list:
    // Teams: shows which players are on which teams and if they're online, as well as the overall score
    // Packet: shows the current packet and done reading button, buttons for selecting "correct" and "incorrect" after buzzes
    // Manual scorekeeping: shows entire scoring table and allows for manual changes
    // Manual timekeeping: allows for manual timekeeping

    useEffect(() => {
        function keyDown(e) {
            if (!gameState) return;
            if (e.code === 'Space') {
                e.preventDefault();
                if (timer.active() && !gameState.timeUp) {
                    socket.cancelTimer();
                } else if (!timer.active() && !gameState.timeUp) {
                    socket.startTimer();
                }
            }
            if (e.code === 'KeyN') {
                if (!timer.active() && gameState.timeUp) {
                    socket.nextQuestion();
                }
            }
        }
        document.addEventListener('keydown', keyDown);

        return function cleanup() {
            document.removeEventListener('keydown', keyDown);
        }
    }, [gameState]);

    if (!gameState) {
        console.log('No game at all');
        return (
        <div className="ModUI">
            <h1 className="text-center">There are currently no games in this room.</h1>
            <h3 className="text-center">Sorry about that! Please contact an administrator if you believe this is in error.</h3>
        </div>
        );
    } else if (!gameState.opened) {
        return (
            <div className="ModUI">
                <TeamsDisplay teams={gameState.teams} isBonus={gameState.onBonus} />
                <h1 className="text-center">The game in this room hasn't been started yet.</h1>
                <Button variant="success" onClick={() => socket.startGame()}>Start Game</Button>
            </div>
        );
    } else if (gameState.finished) {
        return (
            <div className="ModUI">
                <h1 className="text-center">Your game has ended</h1>
                <p className="text-center">If you believe this to be in error, please contact an administrator.</p>
            </div>
        )
    }
    
    return (
        <div className="ModUI">
            <ModBuzzManager buzzActive={gameState.buzzActive} isBonus={gameState.onBonus} answeringTeam={gameState.teams[gameState.answeringTeam]} />
            <TeamsDisplay teams={gameState.teams} isMod isBonus={gameState.onBonus} />
            <QuestionInfo questionNum={gameState.questionNum} isBonus={gameState.onBonus} isMod />
            {/*<BuzzerName buzzer={gameState.buzzActive} user={user} />*/}
            <TimerMan isBonus={gameState.onBonus} timeUp={gameState.timeUp} isMod />
            <PacketComponent url={`${process.env.REACT_APP_API_BASE}/packets/${gameState.roundNum}`} roundNum={gameState.roundNum} questionNum={gameState.questionNum} hasBuzz={gameState.buzzActive !== null} />
            <ScoreboardComponent scoreboard={gameState.scoreboard} questionNum={gameState.questionNum} teamNames={[gameState.teams[0].name, gameState.teams[1].name]} isMod />
            <EndGameComponent />
            <a className="text-center bottom-left" href={room.meetingLink} target="_blank" rel="noreferrer">
                <Button variant="warning">Go to Meeting</Button>
            </a>
        </div>
    );
}

function PlayerUI({ gameState, room, user, teamIndex }) {
    // Panel list:
    // Teams: same
    // Buzz: buzz in

    useEffect(() => {
        function keyDown(e) {
            if (e.code === 'Space') {
                socket.buzz();
            }
        }
        document.addEventListener('keydown', keyDown);

        return function cleanup() {
            document.removeEventListener('keydown', keyDown);
        }
    }, [gameState]);

    if (!gameState) {
        console.log('No game at all');
        return (
        <div className="PlayerUI">
            <h1 className="text-center">There are currently no games in this room.</h1>
            <h3 className="text-center">Sorry about that! Please contact an administrator if you believe this is in error.</h3>
        </div>
        );
    } else if (!gameState.opened) {
        return (
            <div className="PlayerUI">
                <TeamsDisplay teams={gameState.teams} isBonus={gameState.onBonus} />
                <h1 className="text-center">Your game hasn't been started yet</h1>
                <h3 className="text-center">Please stand by.</h3>
            </div>
        );
    } else if (gameState.finished) {
        return (
            <div className="PlayerUI">
                <h1 className="text-center">Your game has ended</h1>
                <p className="text-center">If you believe this to be in error, please contact an administrator.</p>
            </div>
        )
    }
    let movable = (window.innerWidth > 760); // should match computers
    return (
        <div className="PlayerUI">
            <a className="text-center player-meeting-link" href={room.meetingLink}>{room.meetingLink}</a>
            <TeamsDisplay teams={gameState.teams} isBonus={gameState.onBonus} />
            <TimerMan isBonus={gameState.onBonus} />
            <BuzzComponent displayActive={shouldBuzzShowActive(gameState, teamIndex)} movable={movable} />
            <BuzzerName buzzer={gameState.buzzActive} user={user} />
            <ScoreboardComponent scoreboard={gameState.scoreboard} questionNum={gameState.questionNum} teamNames={[gameState.teams[0].name, gameState.teams[1].name]} />
        </div>
    );
}

function Room({ authCallback }) {

    let params = useParams();
    let [joinResponse, setJoinResponse] = useState(null);
    let [gameState, setGameState] = useState(null);

    useEffect(() => {
        socket.connect();
        socket.setOnRoomJoined(data => {
            console.log('Successfully joined room!');
            setJoinResponse(data);
            setGameState(data.room.game);
            authCallback(data.user);
        });
        socket.setOnConnect(() => {
            console.log('Connected!');
            socket.joinRoom({
                room: params.roomId
            });
        });
        socket.setOnUpdate(s => {
            setGameState(s);
        });
        socket.setOnConnectError(console.error);
        socket.setOnJoinError(err => {
            console.error(err);
            if (err.errorCode === 'unauthed') {
                console.log('Unauthenticated - returning to home page.');
                setJoinResponse({
                    success: false,
                    redirect: true
                });
            }
        });

        socket.setOnTimerStart(duration => {
            console.log('timer start');
            timer.setTimer(duration);
            timer.start();
        });

        socket.setOnTimerCancel(() => {
            console.log('timer cancel');
            timer.cancel();
        });

        socket.setOnTimerReset(() => {
            console.log('request to reset timer');
            timer.reset();
        });

    }, []);

    let main = null;
    
    if (joinResponse) {
        if (joinResponse.redirect) {
            return (
                <Navigate to="/" />
            );
        }
        let room = joinResponse.room;
        let user = joinResponse.user;
        let teamIndex = joinResponse.teamIndex;
        main = (
            <div className="room-main text-center">
                { (user.isMod || user.isAdmin) ? <ModUI gameState={gameState} room={room} user={user} teamIndex={teamIndex} /> : <PlayerUI gameState={gameState} room={room} user={user} teamIndex={teamIndex} /> }
            </div>
        )
    } else {
        main = (
            <h1>Joining...</h1>
        );
    }

    return (
        <div className="Room">
            {main}
        </div>
    );

}

export default Room;
