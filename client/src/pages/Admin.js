import './admin.css';
import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import ClipLoader from 'react-spinners/ClipLoader';
import { auth, listTeams, getTournamentInfo, advanceRound, startTournament, createTeam, reloadRound, setRound, getActiveGames } from '../api';
import ErrorPage from './ErrorPage';
import { Toast, Modal, Button } from 'react-bootstrap';

const loaderCSS = `
display: block;
margin: 0 auto;
margin-top: 30px;
`;

function getJoinLink(joinCode) {
    return `https://prometheus.buzz/join/${joinCode}`;
}

function AdminPage({ user }) {
    const [teams, setTeams] = useState(null);
    const [toastInfo, setToastInfo] = useState(null);
    const [tournamentInfo, setTournamentInfo] = useState(null);
    const [activeGames, setActiveGames] = useState(null);
    const [advanceModal, setAdvanceModal] = useState(null);
    const [showCreateTeamModal, setShowCreateTeamModal] = useState(false);
    const [teamCreateCompleted, setTeamCreateCompleted] = useState(null);
    const teamNameRef = useRef(null);
    const nextRoundNumInput = useRef(null);
    function refreshTeamList() {
        listTeams()
            .then(res => {
                let ourTeams = res.data.teams;
                if (ourTeams) {
                    ourTeams.sort((a, b) => new Date(a.createdAt) < new Date(b.createdAt));
                }
                setTeams(ourTeams);
            })
            .catch(console.error);
        getActiveGames()
            .then(res => {
                setActiveGames(res.data.activeGames);
            })
            .catch(console.error);
    }
    useEffect(() => {
        refreshTeamList();
        getTournamentInfo()
            .then(res => {
                res.data.started = (res.data.currentRound !== null);
                setTournamentInfo(res.data);
            })
            .catch(console.error);
    }, []);
    function copyLink(i) {
        let link = getJoinLink(teams[i].joinCode);
        navigator.clipboard.writeText(link);
        setToastInfo({
            text: `Join link for ${teams[i].name} copied to clipboard!`
        });
    }
    const activeGameElems = activeGames ? activeGames.map((game, i) => {
        return (
            <tr key={`game-${i}`}>
                <td>
                    {game.teams[0].name}
                </td>
                <td>
                    {game.teams[1].name}
                </td>
                <td>
                    {game.teams[0].score}-{game.teams[1].score}
                </td>
                <td>
                    {game.roomName}
                </td>
            </tr>
        );
    }) : null;
    const teamElems = teams ? teams.map((team, i) => {
        return (<tr key={i}>
            <th scope="row">{i+1}</th>
            <td>{team.name}</td>
            <td>{team.members.length}</td>
            <td>{team.Room ? team.Room.roomName : 'N/A'}</td>
            <td><button className="get-join-link btn btn-primary" onClick={() => copyLink(i)}>Copy Link</button></td>
        </tr>)
    }) : null;
    let toast = null;
    if (toastInfo) {
        toast = (
            <Toast onClose={() => setToastInfo(null)} delay={3000} autohide bg="success">
                <Toast.Body>{toastInfo.text}</Toast.Body>
            </Toast>
        )
    }
    function refreshRoundBtn() {
        reloadRound()
            .then(res => {
                refreshTeamList();
                console.log('Reloaded round successfully.');
                setAdvanceModal(null);
            })
            .catch(console.error);
    }
    function setRoundBtn() {
        let nextRound = parseInt(nextRoundNumInput.current.value);
        setRound(nextRound)
            .then(res => {
                refreshTeamList();
                setAdvanceModal(null);
                setTournamentInfo({
                    currentRound: res.data.currentRound,
                    started: true
                });
            })
            .catch(console.error);
    }
    function advance() {
        if (tournamentInfo.started) {
            advanceRound()
                .then(res => {
                    if (res.data.success) {
                        setTournamentInfo({
                            currentRound: res.data.currentRound,
                            started: true
                        });
                        refreshTeamList();
                        console.log('Advanced successfully');
                    } else {
                        console.error('Error advancing round');
                    }
                })
                .catch(console.error);
        } else {
            startTournament()
                .then(res => {
                    if (res.data.success) {
                        setTournamentInfo({
                            currentRound: 1,
                            started: true
                        });
                        refreshTeamList();
                        console.log('Started successfully');
                    } else {
                        console.error('Error starting tournament');
                    }
                })
                .catch(console.error);
        }
        setTournamentInfo(tournamentInfo);
        setAdvanceModal(null);
    }
    function createTeamTrigger() {
        let teamName = teamNameRef.current.value;
        teamName = teamName.trim();
        createTeam(teamName)
            .then(team => {
                console.log(`Join code: ${team.data.joinCode}`);
                setShowCreateTeamModal(false);
                refreshTeamList();
            })
            .catch(console.error);
    }
    function displayAdvanceModal() {
        setAdvanceModal({
            action: tournamentInfo.started ? 'Advance Round' : 'Start Tournament'
        });
    }
    function refreshRoundModal() {
        setAdvanceModal({
            action: 'Refresh Round',
            refreshRequest: true
        });
    }
    function setRoundModal() {
        setAdvanceModal({
            action: 'Set Round',
            setRoundRequest: true
        });
    }
    let tournamentDisplay = null;
    if (tournamentInfo) {
        tournamentDisplay = (
            <div id="tournament-display">
                <div className="pb-2 mt-4 mb-2 border-bottom">
                    <h1>Tournament</h1>
                </div>
                <h2>Round: {tournamentInfo.currentRound || 'Not started'}</h2>
                <Button variant="info" onClick={displayAdvanceModal}>{tournamentInfo.started ? "Advance Round" : "Start Tournament"}</Button>
                {tournamentInfo.started && <Button variant="warning" onClick={refreshRoundModal}>Refresh Round</Button>}
                <Button variant="success" onClick={setRoundModal}>Set Round</Button>
            </div>
        )
    }
    let advanceModalElement = null;
    if (advanceModal) {
        let onc = advance;
        if (advanceModal.refreshRequest) {
            onc = refreshRoundBtn;
        } else if (advanceModal.setRoundRequest) {
            onc = setRoundBtn;
        }
        let advanceBody = (
            <p>Are you sure you would like to perform this action?  This cannot be undone.</p>
        );
        if (advanceModal.setRoundRequest) {
            advanceBody = <label>Round: <input type="number" ref={nextRoundNumInput}></input></label>;
        }
        advanceModalElement = (
            <Modal show={advanceModal} onHide={ () => setAdvanceModal(null) }>
                <Modal.Header closeButton>
                    <Modal.Title>{advanceModal.action}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {advanceBody}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={ () => setAdvanceModal(null) }>Close</Button>
                    <Button variant="primary" onClick={onc}>Confirm</Button>
                </Modal.Footer>
            </Modal>
        )
    }
    return (
        <div className="AdminPage">
            <h1 className="text-center">Admin</h1>
            {advanceModalElement}
            <Modal show={showCreateTeamModal} onHide={ () => setShowCreateTeamModal(false) }>
                <Modal.Header closeButton>
                    <Modal.Title>Create Team</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <label>Team Name: <input ref={teamNameRef} /></label>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={ () => setShowCreateTeamModal(false) }>Close</Button>
                    <Button variant="primary" onClick={createTeamTrigger}>Create</Button>
                </Modal.Footer>
            </Modal>
            {tournamentDisplay}
            <div className="pb-2 mt-4 mb-2 border-bottom">
                <h1>Active Games</h1>
            </div>
            <table className="table">
                <thead>
                    <tr>
                        <th scope="col">Team A</th>
                        <th scope="col">Team B</th>
                        <th scope="col">Score</th>
                        <th scope="col">Room</th>
                    </tr>
                </thead>
                <tbody>
                    {activeGameElems}
                </tbody>
            </table>
            <div className="pb-2 mt-4 mb-2 border-bottom">
                <h1>Teams</h1>
            </div>
            <Button id="create-team-btn" variant="success" onClick={() => {
                setShowCreateTeamModal(true);
                setTeamCreateCompleted(false);
            }}>Create Team</Button>
            <table className="table">
                <thead>
                    <tr>
                        <th scope="col">#</th>
                        <th scope="col">Name</th>
                        <th scope="col">Members</th>
                        <th scope="col">Room Assignment</th>
                        <th scope="col">Join Link</th>
                    </tr>
                </thead>
                <tbody>
                    {teamElems}
                </tbody>
            </table>
            {toast}
        </div>
    )
}

function Admin({ authCallback }) {

    const [authResult, setAuthResult] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        auth()
            .then(data => {
                authCallback(data.data.user);
                setAuthResult(data.data);
            })
            .catch(console.error);
    }, []);

    let main = null;
    if (authResult) {
        if (authResult.isAuthed && authResult.user.isAdmin) {
            main = (
                <AdminPage user={authResult.user} />
            )
        } else {
            return <ErrorPage error="Sorry, you don't have permissions to view this page." />
        }
    } else {
        main = (
            <ClipLoader loading={authResult === null} css={loaderCSS} size={50}></ClipLoader>
        )
    }
    return (
        <div className="Admin">
            {main}
        </div>
    )
}

export default Admin;
