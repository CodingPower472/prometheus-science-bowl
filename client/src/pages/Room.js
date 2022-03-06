/* eslint-disable jsx-a11y/anchor-is-valid */
import './Room.css';


import React, { useEffect, useState }  from 'react';
import { useParams, Navigate } from 'react-router-dom';
import { SocketManager } from '../api';
import { Button } from 'react-bootstrap';
import { Rnd } from 'react-rnd';
import ToggleSwitch from './ToggleSwitch';
import CountdownTimer from './CountdownTimer';

let socket = new SocketManager();

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
    console.log('Display active', displayActive);

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
                default={/*{
                    x: 82,
                    y: -112,
                    width: 300,
                    height: 500
                }*/{
                    x: 82,
                    y: -112,
                    width: 400,
                    height: 400
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
        return content;
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
    console.log('rendering question info');
    questionNum += 1; // zero-indexed on server
    function setQuestionNum(e) {
        let next = e.target.value;
        if (next !== '') {
            socket.setQuestionNum(next - 1); // zero-indexed on server
        }
    }
    return (
        <div className="text-center QuestionInfo">
            <h3>Question {isMod ? <input type="number" value={questionNum} onChange={setQuestionNum} className="question-num-input"/> : <span>{questionNum}</span>}</h3>
            <ul className="nav nav-tabs justify-content-center nav-justified tu-bonus-tabs">
                <li className="nav-item">
                    <a className={`nav-link ${isBonus ? "" : "active"}`} href="#" onClick={isMod ? () => socket.setOnBonus(false) : noop}>Toss-Up</a>
                </li>
                <li className="nav-item">
                    <a className={`nav-link ${isBonus ? "active" : ""}`} href="#" onClick={isMod ? () => socket.setOnBonus(true) : noop}>Bonus</a>
                </li>
            </ul>
        </div>
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
                x: 82,
                y: -112,
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

function TimerMan({ timer, isBonus, isMod, timeUp }) {
    let shouldTime = (isBonus ? 22 : 7);
    let [time, setTime] = useState(timer.active() ? timer.remainingTime : shouldTime);
    if (!timer.active() && time !== shouldTime) {
        setTime(shouldTime);
    }
    timer.setSecondCallback(duration => {
        setTime(duration);
    });
    return (
        <div className="TimerMan">
            <h1 className={`timer-text ${timeUp ? 'time-up' : ''}`}>
                {(time !== null) ? `00:${time.toString().padStart(2, '0')}` : null}
            </h1>
            {(isMod && !timer.active()) && (
                <Button variant="primary" className="startTimerBtn" onClick={() => socket.startTimer()}>Start Timer</Button>
            )}
            {(isMod && timer.active() && time === 0) && (
                <Button variant="success" className="nextQuestionBtn" onClick={() => socket.nextQuestion()}>Next Question</Button>
            )}
        </div>
    );
}

function ModUI({ gameState, room, user, timer }) {
    // Panel list:
    // Teams: shows which players are on which teams and if they're online, as well as the overall score
    // Packet: shows the current packet and done reading button, buttons for selecting "correct" and "incorrect" after buzzes
    // Manual scorekeeping: shows entire scoring table and allows for manual changes
    // Manual timekeeping: allows for manual timekeeping

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
    }
    return (
        <div className="ModUI">
            <ModBuzzManager buzzActive={gameState.buzzActive} isBonus={gameState.onBonus} answeringTeam={gameState.teams[gameState.answeringTeam]} />
            <TeamsDisplay teams={gameState.teams} isMod isBonus={gameState.onBonus} />
            <QuestionInfo questionNum={gameState.questionNum} isBonus={gameState.onBonus} isMod />
            <BuzzerName buzzer={gameState.buzzActive} user={user} />
            <TimerMan timer={timer} isBonus={gameState.onBonus} timeUp={gameState.timeUp} isMod />
        </div>
    );
}

function PlayerUI({ gameState, room, user, teamIndex, timer }) {
    // Panel list:
    // Teams: same
    // Buzz: buzz in
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
    }
    console.log(`Active: ${gameState.buzzActive}`);
    return (
        <div className="PlayerUI">
            <TeamsDisplay teams={gameState.teams} isBonus={gameState.onBonus} />
            <TimerMan timer={timer} isBonus={gameState.onBonus} />
            <BuzzComponent displayActive={shouldBuzzShowActive(gameState, teamIndex)} movable />
            <BuzzerName buzzer={gameState.buzzActive} user={user} />
        </div>
    );
}

function Room({ authCallback }) {

    let params = useParams();
    let [joinResponse, setJoinResponse] = useState(null);
    let [gameState, setGameState] = useState(null);
    let [timer, setTimer] = useState(new CountdownTimer());

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
        socket.setOnUpdate(state => {
            console.log('update!a');
            console.log(state);
            setGameState(state);
        });
        socket.setOnConnectError(console.error);
        socket.setOnJoinError(err => {
            console.log(err);
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
            let nextTimer = new CountdownTimer(timer);
            nextTimer.setTimer(duration);
            nextTimer.start();
            setTimer(nextTimer);
        });

        socket.setOnTimerCancel(() => {
            console.log('timer cancel');
            let nextTimer = new CountdownTimer(timer);
            nextTimer.cancel();
            setTimer(nextTimer);
        });

        socket.setOnTimerReset(() => {
            let nextTimer = new CountdownTimer(timer);
            nextTimer.reset();
            setTimer(nextTimer);
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
            <div className="main text-center">
                <h1 className="room-name">Room {room.roomName}</h1>
                { (user.isMod || user.isAdmin) ? <ModUI timer={timer} gameState={gameState} room={room} user={user} teamIndex={teamIndex} /> : <PlayerUI timer={timer} gameState={gameState} room={room} user={user} teamIndex={teamIndex} /> }
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
