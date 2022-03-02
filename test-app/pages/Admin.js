import './admin.css';
import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import ClipLoader from 'react-spinners/ClipLoader';
import { auth, listTeams, getTournamentInfo, advanceRound, startTournament, createTeam } from '../api';
import ErrorPage from './ErrorPage';
import { Toast, Modal, Button } from 'react-bootstrap';
import { application } from 'express';

const loaderCSS = `
display: block;
margin: 0 auto;
margin-top: 30px;
`;

function getJoinLink(joinCode) {
    return `http://localhost:3000/join/${joinCode}`;
}

function AdminPage(props) {
    const [teams, setTeams] = useState(null);
    const [toastInfo, setToastInfo] = useState(null);
    const [tournamentInfo, setTournamentInfo] = useState(null);
    const [advanceModal, setAdvanceModal] = useState(null);
    const [showCreateTeamModal, setShowCreateTeamModal] = useState(false);
    const [teamCreateCompleted, setTeamCreateCompleted] = useState(null);
    const teamNameRef = useRef();
    useEffect(() => {
        listTeams()
            .then(res => {
                setTeams(res.data.teams);
            })
            .catch(console.error);
        getTournamentInfo()
            .then(res => {
                res.data.started = (res.data.currentRound !== null);
                console.log(res.data);
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
    const teamElems = teams ? teams.map((team, i) => {
        return (<tr key={i}>
            <th scope="row">{i+1}</th>
            <td>{team.name}</td>
            <td>{team.members.length}</td>
            <td>{team.roomId || 'N/A'}</td>
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
    async function advance() {
        if (tournamentInfo.started) {
            await advanceRound();
            tournamentInfo.roundNum++;
        } else {
            await startTournament();
            tournamentInfo.roundNum = 1;
            tournamentInfo.started = true;
        }
        setTournamentInfo(tournamentInfo);
        setAdvanceModal(null);
    }
    function createTeam() {
        let teamName = teamNameRef.current.value;
        teamName = teamName.trim();
        createTeam(teamName)
            .then(team => {
                console.log(`Join code: ${team.joinCode}`);
            })
            .catch(console.error);
    }
    function displayAdvanceModal() {
        setAdvanceModal({
            action: tournamentInfo.started ? 'Advance Round' : 'Start Tournament'
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
                <Button variant="dark" onClick={displayAdvanceModal}>{tournamentInfo.started ? "Advance Round" : "Start Tournament"}</Button>
            </div>
        )
    }
    let advanceModalElement = null;
    if (advanceModal) {
        advanceModalElement = (
            <Modal show={advanceModal} onHide={ () => setAdvanceModal(false) }>
                <Modal.Header closeButton>
                    <Modal.Title>{advanceModal.action}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <p>Are you sure you would like to perform this action?  This cannot be undone.</p>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={ () => setAdvanceModal(null) }>Close</Button>
                    <Button variant="primary" onClick={advance}>Confirm</Button>
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
                    <Button variant="primary" onClick={createTeam}>Create</Button>
                </Modal.Footer>
            </Modal>
            {tournamentDisplay}
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

function Admin() {

    const [authResult, setAuthResult] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        auth()
            .then(data => {
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
