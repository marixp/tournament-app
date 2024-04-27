import React, {useState} from 'react';
import './css/tourn-style.css';

const Tournament = () => {
    const [numTeams, setNumTeams] = useState(0);
    const [teams, setTeams] = useState([]);
    const [viewMode, setViewMode] = useState('pyramid');
    //const [currChallenge, setCurrChallenge] = useState(null);
    //const [selectedTeam, setSelectedTeam] = useState(null);
    //const [challengedTeam, setChallengedTeam] = useState(null);

    //handle user request # teams
    const handleNumTeamsChange = (e) => {
        const teams = parseInt(e.target.value);
        setNumTeams(teams);
        generateTeams(teams);
    };
    //generate # teams to add to pyramid/ladder
    const generateTeams = (numTeams) => {
        const newTeams = [];
        for(let i=1; i <= numTeams; i++) {
            newTeams.push({ id: i, wins: 0, losses: 0, level: null });
        }
        setTeams(newTeams);
    };
    //switch between pyramid or ladder views
    const toggleViewMode = () => {
        setViewMode(viewMode === 'pyramid' ? 'ladder' : 'pyramid');
    };
    //assign a loser/ winner depending on the reported match outcome
    const handleMatchOutcome = (winnerId, loserId) => {
        const updatedTeams = [...teams];
        const winnerIndex = updatedTeams.findIndex((team) => team.id === winnerId);
        const loserIndex = updatedTeams.findIndex((team) => team.id === loserId);
        //update wins & losses
        updatedTeams[winnerIndex].wins++;
        updatedTeams[loserIndex].losses++;
        //sort teams based on ranking (ratio of losses to wins)
        updatedTeams.sort((a, b) => {
            const ratioA = a.losses === 0 ? Infinity : a.wins / a.losses;
            const ratioB = b.losses === 0 ? Infinity : b.wins / b.losses;
            return ratioB - ratioA;
        });
        setTeams(updatedTeams);
    };
    //create the pyramid view setup
    const renderPyramidView = (teams) => {
        //calculate # levels (rungs) & team distrubition per level from user input
        const levels = Math.ceil(Math.sqrt(2 * teams.length + 0.25) - 0.5);
        const pyramid = [];
        //add teams to the pyramid top to bottom increasing by 1 as we go add more 
        //(new teams added to last available spot for now)
        for( let i=0; i < levels; i++) {
            const levelTeams = teams.slice(i * (i+1) / 2, (i+1) * (i+2) / 2);
            //push teaam info onto the pyramid by levels. descending order
            pyramid.push(
                <div key={i} className='pyramid-level'>
                    <div className='level-num'>Level {i+1}</div>
                    {levelTeams.map((team) => (
                        <div key={team.id} className='grid-item'>
                            <div className='overlay'>
                                <button className='chall-but' onClick={() => handleChallenge(team.id)}>Challenge</button>
                            </div>
                            {`Rank ${team.id}`}
                        </div>
                        
                    ))}
                </div>
            );
        }
        return pyramid;
    };
    //create ladder view setup
    const renderLadderView = (teams, handleMatchOutcome) => {
        //render # levels based on # teams input from user
        const levels = Math.ceil(Math.sqrt(2 * teams.length + 0.25) - 0.5);
        const ladder = [];
        //add teams to each rung calculating same way as pyramids
        for( let i=0; i < levels; i++) {
            const levelTeams = teams.slice(i * (i+1) / 2, (i+1) * (i+2) / 2);
            //push each team's info as a grid-item into the corresponding ladder levels
            ladder.push(
                <div key={i} className='ladder-level'>
                    <div className='level-num'>Level {i+1}</div>
                    {levelTeams.map((team) => (
                        <div key={team.id} className='grid-item'>
                            <div className='overlay'>
                                <button className='chall-but' onClick={() => handleChallenge(team.id)}>Challenge</button>
                            </div>
                                {`Rank ${team.id}`} 
                        </div>
                    ))}
                </div>
            );
        }
        return ladder;
    };
    //handle action when user presses challenge button
    const handleChallenge = (challengerId) => {
        //basic func to prompt user to enter which team to challenge
        const oppId = prompt('Enter the ID of the team you want to challenge: ');
        if( !oppId ) return; //handle cancelled or empty input
        //get index values for challenging & opposing teams
        const challengerIndex = teams.findIndex((team) => team.id === challengerId);
        const oppIndex = teams.findIndex((team) => team.id === parseInt(oppId));
        //get level of challenger and opponent
        const challengerLvl = Math.ceil(Math.sqrt(2 * (challengerIndex+1) + 0.25) - 0.5);
        const oppLvl = Math.ceil(Math.sqrt(2 * (oppIndex+1) + 0.25) - 0.5);
        //check opponent id is valid
        if( oppIndex === -1 ) {
            alert('Invalid opponent ID.');
            return;
        }
        //check if opponent is valid: same or only 1 level above the challenger
        if(
            (oppIndex < challengerIndex && challengerLvl === oppLvl) ||     //opp same level
            (oppLvl === challengerLvl -1)//one level above
        ){
            const deadline = new Date();
            deadline.setDate(deadline.getDate() + 7); //7 days from now
            alert(`Challenge sent to Team ${oppId}. Deadline: ${deadline}`);
            //update current challenge state
            //setCurrChallenge({challengerId, oppId, deadline});
            return;
        }else{
            alert(`You may only challenge teams on the same level or one level above you. 
            Your ID is ${challengerId}, the chosen opponent was ${oppId}`);
        }
    };
        /*
    const acceptChallenge = () => {
        //accept challange, update team rankings, reset currChallenge state
        const updatedTeams = {...teams};
        const challengerIndex = updatedTeams.findIndex((team) => team.id === currChallenge.challenger.id);
        const oppIndex = updatedTeams.findIndex((team) => team.id === currChallenge.opp.id);

        //teams swap places
        const temp = updatedTeams[challengerIndex];
        updatedTeams[challengerIndex] = updatedTeams[oppIndex];
        updatedTeams[oppIndex] = temp;

        setTeams(updatedTeams);
        setCurrChallenge(null);
    };
    const rejectChallenge = () => {
        setCurrChallenge(null);
    };

   /*
    const handleChallenge = (teamId) => {
        //set deadline for accepting & completing the challenge
        const deadline = new Date();
        deadline.setDate(deadline.getDate() + 7); //7 days from now
        setSelectedTeam(teamId);
    };
    const acceptChallenge = () => {
        setChallengedTeam(selectedTeam);
        setSelectedTeam(null);
    };
    const rejectChallenge = () => {
        setSelectedTeam(null);
    };
    const completeChallenge = (winnerId, loserId) => {
        handleMatchOutcome(winnerId, loserId);
        setChallengedTeam(null);
    };
    */


    return(
        <div className='tournament-container'>
            <input
                type="number"
                value={numTeams}
                onChange={handleNumTeamsChange}
                placeholder="Enter number of teams"
            />
            <button onClick={toggleViewMode}>Toggle View</button>
            <div className={viewMode ==='pyramid' ? 'pyramid-container' : 'ladder-container'}>
                {viewMode === 'pyramid' ? renderPyramidView(teams) : renderLadderView(teams, handleMatchOutcome)}
            </div>

            {/*CHALLENGES:
            {currChallenge && (
                <div className='challenge'>
                    <p>{`Team ${currChallenge.challenger.id} challenges Team ${currChallenge.opp.id}!`}</p>
                    <button onClick={acceptChallenge}>Accept Challenge</button>
                    <button onClick={rejectChallenge}>Reject Challenge</button>
                    <p>{`Deadline: ${currChallenge.deadline.toLocaleDateString()}`}</p>
                </div>
            )}
            {selectedTeam && (
                <div className='challenge'>
                    <p>{`Team ${teams.id} challenges Team ${selectedTeam}!`}</p>
                    <button onClick={acceptChallenge}>Accept Challenge</button>
                    <button onClick={rejectChallenge}>Reject Challenge</button>
                    <p>{`Deadline: ${handleChallenge.deadline}`}</p>
                </div>
            )}
            {challengedTeam && (
                <div className='challenge-complete'>
                    <p>Challanged Team: {challengedTeam}</p>
                    <button onClick={() => completeChallenge(selectedTeam, challengedTeam)}>Completed Challenge!</button>
                </div>                
            )}
        */}
        </div>
    );
};

export default Tournament;