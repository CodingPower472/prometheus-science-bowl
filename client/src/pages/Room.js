
import './Room.css';

import React, { useEffect, useState }  from 'react';
import { useParams, Navigate } from 'react-router-dom';
import { SocketManager } from '../api';
import { Button } from 'react-bootstrap';

let socket = new SocketManager();

function TeamsDisplay({ teams }) {
    console.log(teams);
    function mapPlayers(players) {
        return players.map((player, i) => {
            return (
                <li key={i} className={player.joined ? "player-name joined" : "player-name away"}>
                    {player.fullName}
                </li>
            );
        });
    }
    let teamAPlayers = teams[0] ? mapPlayers(teams[0].members) : null;
    let teamBPlayers = teams[1] ? mapPlayers(teams[1].members) : null;
    return (
        <div className="TeamsDisplay">
            <div className="panel panel-left">
                <h5>{teams[0] ? teams[0].name : 'Team A'}</h5>
                <hr></hr>
                <ul className="players-list">
                    {teamAPlayers}
                </ul>
            </div>
            <div className="panel panel-right">
                <h5>{teams[1] ? teams[1].name : 'Team B'}</h5>
                <hr></hr>
                <ul className="players-list">
                    {teamBPlayers}
                </ul>
            </div>
        </div>
    );
}

function BuzzComponent({ buzzActive }) {
    let active = !buzzActive;
    return (
        <div className="BuzzComponent">
            <button className={active ? "buzzer buzzer-active" : "buzzer buzzer-inactive"} onClick={() => socket.buzz()}>
            </button>
        </div>
    );
}

function ModUI({ gameState, room, user }) {
    // Panel list:
    // Teams: shows which players are on which teams and if they're online, as well as the overall score
    // Packet: shows the current packet and done reading button, buttons for selecting "correct" and "incorrect" after buzzes
    // Manual scorekeeping: shows entire scoring table and allows for manual changes
    // Manual timekeeping: allows for manual timekeeping

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
                <TeamsDisplay teams={room.game.teams} />
                <h1 className="text-center">The game in this room hasn't been started yet.</h1>
                <Button variant="success" onClick={() => socket.startGame()}>Start Game</Button>
            </div>
        );
    }
    return (
        <div className="PlayerUI">
            <TeamsDisplay teams={room.game.teams} />
        </div>
    );
}

function PlayerUI({ gameState, room, user }) {
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
                <TeamsDisplay teams={room.game.teams} />
                <h1 className="text-center">Your game hasn't been started yet</h1>
                <h3 className="text-center">Please stand by.</h3>
            </div>
        );
    }
    return (
        <div className="PlayerUI">
            <TeamsDisplay teams={room.game.teams} />
            <BuzzComponent buzzActive={room.game.buzzActive} />
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
        socket.setOnUpdate(state => {
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
    }, [params.roomId]);

    let main = null;
    
    if (joinResponse) {
        if (joinResponse.redirect) {
            return (
                <Navigate to="/" />
            );
        }
        let room = joinResponse.room;
        let user = joinResponse.user;
        main = (
            <div className="main text-center">
                <h1>Room {room.roomName}</h1>
                { (user.isMod || user.isAdmin) ? <ModUI socket={socket} gameState={gameState} room={room} user={user}/> : <PlayerUI socket={socket} gameState={gameState} room={room} user={user}/> }
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
