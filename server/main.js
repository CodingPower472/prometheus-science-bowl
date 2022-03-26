
const db = require('./db');
const gen = require('./gen-codes');
const autoRound = require('./auto-round');
const { Game } = require('./Game');
const logger = require('./logger');

const express = require('express');
require('dotenv').config();
const cors = require('cors');
//const sessions = require('express-session');
const bodyParser = require('body-parser');
const { OAuth2Client } = require('google-auth-library');
const { application } = require('express');
const { use } = require('express/lib/application');
const client = new OAuth2Client(process.env.CLIENT_ID);
const http = require('http');
const chalk = require('chalk');
//const sharedsession = require('express-socket.io-session');
const cookieParser = require('cookie-parser');
const cookie = require('cookie');
const path = require('path');

const { Server } = require('socket.io');

const app = express();
const server = http.Server(app);
let ioOptions = {};

if (process.env.CORS === 'on') {
    app.use(cors({
        origin: process.env.CLIENT_URL,
        credentials: true,
        allowedHeaders: ['Content-Type', 'Authorization'],
    }));
    ioOptions.cors = {
        origin: `${process.env.CLIENT_URL}`,
        methods: ['GET', 'POST'],
        credentials: true
    };
}

const io = new Server(server, ioOptions);

app.set('trust proxy', 1);
app.use(bodyParser.json());
const cparser = cookieParser(process.env.SESSION_SECRET);
app.use(cparser);

try {
    db.start(async () => {
        /*let info = await db.getTournamentInfo();
        if (info.currentRound !== null) {
            await saveGames();
            await autoRound.updateRoomAssignments(info.currentRound);
            await createGames(info.currentRound);
        }*/
    });
} catch (err) {
    console.error(chalk.red(err));
}

async function authSocket(socket) {
    try {
        if (!socket.handshake.headers.cookie) return null;
        let ourCookie = cookie.parse(socket.handshake.headers.cookie);
        let token = cookieParser.signedCookie(ourCookie.authtoken, process.env.SESSION_SECRET);
        if (!token) return null;
        return await db.findUserWithAuthToken(token);
    } catch (err) {
        console.error(chalk.red(err));
        console.trace(err);
        return null;
    }
}

let currentGames = {"11":{"teams":[{"id":99,"name":"Fremd A","joinCode":"dlgq9ft8l4p0z9g3en5uo6q75975wsd0","roomId":11,"createdAt":"2022-03-19T02:27:52.853Z","updatedAt":"2022-03-26T15:42:40.577Z","members":[{"id":344,"fullName":"Revanth Madamsetty","email":"madamsetty9872@students.d211.org","googleId":"101964031622795419780","teamPosition":805213,"roomId":11,"isPlayer":true,"isMod":false,"isAdmin":false,"createdAt":"2022-03-23T18:30:49.967Z","updatedAt":"2022-03-26T15:42:40.577Z","teamId":99,"joined":true,"focused":true,"buzzing":false},{"id":290,"fullName":"Jessica Sun","email":"sun7295@students.d211.org","googleId":"100195709384550951976","teamPosition":774698,"roomId":11,"isPlayer":true,"isMod":false,"isAdmin":false,"createdAt":"2022-03-21T17:39:54.241Z","updatedAt":"2022-03-26T15:42:40.577Z","teamId":99,"joined":true,"focused":true,"buzzing":false},{"id":276,"fullName":"Kelly Wang","email":"wang1064@students.d211.org","googleId":"114146625018860407982","teamPosition":346759,"roomId":11,"isPlayer":true,"isMod":false,"isAdmin":false,"createdAt":"2022-03-20T16:22:41.327Z","updatedAt":"2022-03-26T15:42:40.577Z","teamId":99,"joined":true,"focused":true,"buzzing":false},{"id":556,"fullName":"Akshay Dalvi","email":"akshay.dalvi128@gmail.com","googleId":"116740514499842672321","teamPosition":751874,"roomId":11,"isPlayer":true,"isMod":false,"isAdmin":false,"createdAt":"2022-03-26T14:01:47.442Z","updatedAt":"2022-03-26T15:42:40.577Z","teamId":99,"joined":true,"focused":true,"buzzing":false},{"id":340,"fullName":"Garrick K","email":"cactusesnimroys@gmail.com","googleId":"100049144469225771493","teamPosition":511933,"roomId":11,"isPlayer":true,"isMod":false,"isAdmin":false,"createdAt":"2022-03-23T18:04:22.753Z","updatedAt":"2022-03-26T15:42:40.577Z","teamId":99,"joined":true,"focused":true,"buzzing":false}],"Room":{"id":11,"roomName":"A-1","meetingLink":"https://prometheus.science/ampere152","createdAt":"2022-03-25T18:15:16.975Z","updatedAt":"2022-03-25T18:15:16.975Z"},"score":0,"lockedOut":false},{"id":66,"name":"SCGSSM B","joinCode":"ziqtbmwv1jw22iakfc9kdwt3ebumw6s2","roomId":11,"createdAt":"2022-03-16T00:57:33.000Z","updatedAt":"2022-03-26T15:42:40.577Z","members":[{"id":474,"fullName":"Harris Kiaris","email":"harriskiaris@gmail.com","googleId":"106319042743918244652","teamPosition":388175,"roomId":11,"isPlayer":true,"isMod":false,"isAdmin":false,"createdAt":"2022-03-25T23:55:20.176Z","updatedAt":"2022-03-26T15:42:40.577Z","teamId":66,"joined":true,"focused":true},{"id":204,"fullName":"Nathan Phan","email":"nathanphanactual12345@gmail.com","googleId":"115170618511698253576","teamPosition":83898,"roomId":11,"isPlayer":true,"isMod":false,"isAdmin":false,"createdAt":"2022-03-17T21:39:37.285Z","updatedAt":"2022-03-26T15:42:40.577Z","teamId":66,"joined":true,"focused":true},{"id":583,"fullName":"Audrey Cobb","email":"maxcat107@gmail.com","googleId":"113773064141805845043","teamPosition":272350,"roomId":11,"isPlayer":true,"isMod":false,"isAdmin":false,"createdAt":"2022-03-26T15:28:00.289Z","updatedAt":"2022-03-26T15:42:40.577Z","teamId":66,"joined":true,"focused":true},{"id":551,"fullName":"Lauren Hattan","email":"laurenhattan24@gmail.com","googleId":"108792874208353118742","teamPosition":887151,"roomId":11,"isPlayer":true,"isMod":false,"isAdmin":false,"createdAt":"2022-03-26T12:17:25.038Z","updatedAt":"2022-03-26T15:42:40.577Z","teamId":66,"joined":true,"focused":true}],"Room":{"id":11,"roomName":"A-1","meetingLink":"https://prometheus.science/ampere152","createdAt":"2022-03-25T18:15:16.975Z","updatedAt":"2022-03-25T18:15:16.975Z"},"score":0}],"opened":false,"questionNum":0,"finished":false,"buzzActive":null,"onBonus":false,"scoreboard":{"questions":[[[],[]],[[],[]],[[],[]],[[],[]],[[],[]],[[],[]],[[],[]],[[],[]],[[],[]],[[],[]],[[],[]],[[],[]],[[],[]],[[],[]],[[],[]],[[],[]],[[],[]],[[],[]],[[],[]],[[],[]],[[],[]],[[],[]],[[],[]],[[],[]]],"whoBuzzed":[[null,null],[null,null],[null,null],[null,null],[null,null],[null,null],[null,null],[null,null],[null,null],[null,null],[null,null],[null,null],[null,null],[null,null],[null,null],[null,null],[null,null],[null,null],[null,null],[null,null],[null,null],[null,null],[null,null],[null,null]],"offsets":[0,0],"currentSize":24},"questionTimer":null,"timeUp":false,"timerRunning":false,"roundNum":1},"12":{"teams":[{"id":10,"name":"Dulles A","joinCode":"lyj7bwlxwc57hudip90q44nez8m6vfv6","roomId":12,"createdAt":"2022-03-16T00:57:33.000Z","updatedAt":"2022-03-26T15:42:40.573Z","members":[{"id":208,"fullName":"Viraj Negandhi","email":"virajcnegandhi@gmail.com","googleId":"114720212150770111881","teamPosition":998701,"roomId":12,"isPlayer":true,"isMod":false,"isAdmin":false,"createdAt":"2022-03-18T01:58:34.233Z","updatedAt":"2022-03-26T15:42:40.573Z","teamId":10,"joined":true,"focused":true,"buzzing":false},{"id":528,"fullName":"Anant","email":"stemanant@gmail.com","googleId":"106355096435215503757","teamPosition":486624,"roomId":12,"isPlayer":true,"isMod":false,"isAdmin":false,"createdAt":"2022-03-26T04:44:51.686Z","updatedAt":"2022-03-26T15:42:40.573Z","teamId":10,"joined":true,"focused":true,"buzzing":false},{"id":547,"fullName":"justin","email":"justinhli@yahoo.com","googleId":"100788041485778558967","teamPosition":193833,"roomId":12,"isPlayer":true,"isMod":false,"isAdmin":false,"createdAt":"2022-03-26T11:33:49.276Z","updatedAt":"2022-03-26T15:42:40.573Z","teamId":10,"joined":false,"focused":false,"buzzing":false},{"id":549,"fullName":"Rushil Shah","email":"rushilnshah2@gmail.com","googleId":"116807051909331854620","teamPosition":968316,"roomId":12,"isPlayer":true,"isMod":false,"isAdmin":false,"createdAt":"2022-03-26T12:08:59.614Z","updatedAt":"2022-03-26T15:42:40.573Z","teamId":10,"joined":false,"focused":false,"buzzing":false},{"id":95,"fullName":"Akul S [Dulles Cap]","email":"akulsaxena04@gmail.com","googleId":"117012977397125715122","teamPosition":459431,"roomId":12,"isPlayer":true,"isMod":false,"isAdmin":false,"createdAt":"2022-03-16T04:51:29.898Z","updatedAt":"2022-03-26T15:42:40.573Z","teamId":10,"joined":true,"focused":true,"buzzing":false}],"Room":{"id":12,"roomName":"A-2","meetingLink":"https://prometheus.science/ampere152","createdAt":"2022-03-25T18:15:16.975Z","updatedAt":"2022-03-25T18:15:16.975Z"},"score":0,"lockedOut":false},{"id":65,"name":"Wootton B","joinCode":"e9oxcvf6uxs5yxfs7xmcqst7ddwn4rl8","roomId":12,"createdAt":"2022-03-16T00:57:33.000Z","updatedAt":"2022-03-26T15:42:40.578Z","members":[{"id":388,"fullName":"Yashaswin Shivaprasad","email":"yash.shivaprasad@gmail.com","googleId":"116932502356498335351","teamPosition":768009,"roomId":12,"isPlayer":true,"isMod":false,"isAdmin":false,"createdAt":"2022-03-24T17:14:54.574Z","updatedAt":"2022-03-26T15:42:40.578Z","teamId":65,"joined":true,"focused":true},{"id":256,"fullName":"Olivia Shi","email":"oliviashi02@gmail.com","googleId":"102205437024781310333","teamPosition":702225,"roomId":12,"isPlayer":true,"isMod":false,"isAdmin":false,"createdAt":"2022-03-20T02:12:25.165Z","updatedAt":"2022-03-26T15:42:40.578Z","teamId":65,"joined":true,"focused":true},{"id":387,"fullName":"Zixuan Zhu","email":"logic221111@gmail.com","googleId":"108804349565439609159","teamPosition":46347,"roomId":12,"isPlayer":true,"isMod":false,"isAdmin":false,"createdAt":"2022-03-24T17:14:14.555Z","updatedAt":"2022-03-26T15:42:40.578Z","teamId":65,"joined":true,"focused":true},{"id":584,"fullName":"Darek Yu","email":"darekyu06@gmail.com","googleId":"105491329943661358551","teamPosition":915576,"roomId":12,"isPlayer":true,"isMod":false,"isAdmin":false,"createdAt":"2022-03-26T15:30:26.875Z","updatedAt":"2022-03-26T15:42:40.578Z","teamId":65},{"id":586,"fullName":"Claire D","email":"clairemusical25@gmail.com","googleId":"110145982985936269728","teamPosition":608808,"roomId":12,"isPlayer":true,"isMod":false,"isAdmin":false,"createdAt":"2022-03-26T15:31:59.434Z","updatedAt":"2022-03-26T15:42:40.578Z","teamId":65,"joined":false,"focused":false},{"id":207,"fullName":"Abdur-Rahman Shakir","email":"238737@mcpsmd.net","googleId":"111196131068551016073","teamPosition":108550,"roomId":12,"isPlayer":true,"isMod":false,"isAdmin":false,"createdAt":"2022-03-18T00:40:18.020Z","updatedAt":"2022-03-26T15:42:40.578Z","teamId":65,"joined":true,"focused":true}],"Room":{"id":12,"roomName":"A-2","meetingLink":"https://prometheus.science/ampere152","createdAt":"2022-03-25T18:15:16.975Z","updatedAt":"2022-03-25T18:15:16.975Z"},"score":0}],"opened":false,"questionNum":0,"finished":false,"buzzActive":null,"onBonus":false,"scoreboard":{"questions":[[[],[]],[[],[]],[[],[]],[[],[]],[[],[]],[[],[]],[[],[]],[[],[]],[[],[]],[[],[]],[[],[]],[[],[]],[[],[]],[[],[]],[[],[]],[[],[]],[[],[]],[[],[]],[[],[]],[[],[]],[[],[]],[[],[]],[[],[]],[[],[]]],"whoBuzzed":[[null,null],[null,null],[null,null],[null,null],[null,null],[null,null],[null,null],[null,null],[null,null],[null,null],[null,null],[null,null],[null,null],[null,null],[null,null],[null,null],[null,null],[null,null],[null,null],[null,null],[null,null],[null,null],[null,null],[null,null]],"offsets":[0,0],"currentSize":24},"questionTimer":null,"timeUp":false,"timerRunning":false,"roundNum":1},"13":{"teams":[{"id":130,"name":"Minnetonka","joinCode":"8vimm1o6yo0jbxe63nsse2gs9eqxpx3h","roomId":13,"createdAt":"2022-03-23T01:52:39.350Z","updatedAt":"2022-03-26T15:42:40.575Z","members":[{"id":531,"fullName":"Rory Cole","email":"998425@mtka.org","googleId":"101807867115638283233","teamPosition":164615,"roomId":13,"isPlayer":true,"isMod":false,"isAdmin":false,"createdAt":"2022-03-26T05:13:24.376Z","updatedAt":"2022-03-26T15:42:40.575Z","teamId":130,"joined":true,"focused":true,"buzzing":false},{"id":510,"fullName":"Emily Nikas","email":"egn1440@gmail.com","googleId":"118330928423382717887","teamPosition":988161,"roomId":13,"isPlayer":true,"isMod":false,"isAdmin":false,"createdAt":"2022-03-26T02:54:36.293Z","updatedAt":"2022-03-26T15:42:40.575Z","teamId":130,"joined":true,"focused":true,"buzzing":false},{"id":362,"fullName":"Elizabeth Morgan","email":"009673@mtka.org","googleId":"102094291890893384908","teamPosition":186642,"roomId":13,"isPlayer":true,"isMod":false,"isAdmin":false,"createdAt":"2022-03-24T01:48:44.099Z","updatedAt":"2022-03-26T15:42:40.575Z","teamId":130,"joined":true,"focused":true,"buzzing":false},{"id":366,"fullName":"Jerry Zhang","email":"014205@mtka.org","googleId":"115803777728343599756","teamPosition":450193,"roomId":13,"isPlayer":true,"isMod":false,"isAdmin":false,"createdAt":"2022-03-24T02:22:48.741Z","updatedAt":"2022-03-26T15:42:40.575Z","teamId":130,"joined":false,"focused":false,"buzzing":false},{"id":513,"fullName":"William Walker","email":"003731@mtka.org","googleId":"114994129520153795790","teamPosition":673372,"roomId":13,"isPlayer":true,"isMod":false,"isAdmin":false,"createdAt":"2022-03-26T03:09:14.747Z","updatedAt":"2022-03-26T15:42:40.575Z","teamId":130,"joined":true,"focused":true,"buzzing":false}],"Room":{"id":13,"roomName":"A-3","meetingLink":"https://prometheus.science/ampere152","createdAt":"2022-03-25T18:15:16.975Z","updatedAt":"2022-03-25T18:15:16.975Z"},"score":0,"lockedOut":false},{"id":97,"name":"Montgomery","joinCode":"frzfl144thyvdy3qmdq931wafxz0c3rh","roomId":13,"createdAt":"2022-03-19T02:27:33.413Z","updatedAt":"2022-03-26T15:42:40.576Z","members":[{"id":275,"fullName":"Karthik Gourabathuni","email":"kgourabathuni@gmail.com","googleId":"113807438197658884296","teamPosition":991177,"roomId":13,"isPlayer":true,"isMod":false,"isAdmin":false,"createdAt":"2022-03-20T16:14:12.782Z","updatedAt":"2022-03-26T15:42:40.576Z","teamId":97,"joined":true,"focused":true},{"id":273,"fullName":"Krish Gupta","email":"krishgupta497@gmail.com","googleId":"107347559527181389117","teamPosition":475389,"roomId":13,"isPlayer":true,"isMod":false,"isAdmin":false,"createdAt":"2022-03-20T15:21:02.856Z","updatedAt":"2022-03-26T15:42:40.576Z","teamId":97,"joined":true,"focused":true}],"Room":{"id":13,"roomName":"A-3","meetingLink":"https://prometheus.science/ampere152","createdAt":"2022-03-25T18:15:16.975Z","updatedAt":"2022-03-25T18:15:16.975Z"},"score":0}],"opened":false,"questionNum":0,"finished":false,"buzzActive":null,"onBonus":false,"scoreboard":{"questions":[[[],[]],[[],[]],[[],[]],[[],[]],[[],[]],[[],[]],[[],[]],[[],[]],[[],[]],[[],[]],[[],[]],[[],[]],[[],[]],[[],[]],[[],[]],[[],[]],[[],[]],[[],[]],[[],[]],[[],[]],[[],[]],[[],[]],[[],[]],[[],[]]],"whoBuzzed":[[null,null],[null,null],[null,null],[null,null],[null,null],[null,null],[null,null],[null,null],[null,null],[null,null],[null,null],[null,null],[null,null],[null,null],[null,null],[null,null],[null,null],[null,null],[null,null],[null,null],[null,null],[null,null],[null,null],[null,null]],"offsets":[0,0],"currentSize":24},"questionTimer":null,"timeUp":false,"timerRunning":false,"roundNum":1},"14":{"teams":[{"id":70,"name":"HHR B","joinCode":"yokxtyob33gjlaqlwt1f4mh5amd05v1o","roomId":14,"createdAt":"2022-03-16T00:57:33.000Z","updatedAt":"2022-03-26T15:42:40.580Z","members":[{"id":289,"fullName":"Eric Huang","email":"eric.huang@haashall.org","googleId":"100814200561382847445","teamPosition":443913,"roomId":14,"isPlayer":true,"isMod":false,"isAdmin":false,"createdAt":"2022-03-21T17:33:06.769Z","updatedAt":"2022-03-26T15:42:40.580Z","teamId":70,"joined":true,"focused":true,"buzzing":false},{"id":451,"fullName":"Hao Nguyen","email":"hao.nguyen@haashall.org","googleId":"115134976037408420128","teamPosition":820063,"roomId":14,"isPlayer":true,"isMod":false,"isAdmin":false,"createdAt":"2022-03-25T21:38:47.042Z","updatedAt":"2022-03-26T15:42:40.580Z","teamId":70,"joined":true,"focused":true,"buzzing":false},{"id":217,"fullName":"Andrew Pleiman","email":"andrew.pleiman@haashall.org","googleId":"113088911166289089966","teamPosition":747854,"roomId":14,"isPlayer":true,"isMod":false,"isAdmin":false,"createdAt":"2022-03-18T22:05:28.615Z","updatedAt":"2022-03-26T15:42:40.580Z","teamId":70,"joined":true,"focused":true,"buzzing":false},{"id":469,"fullName":"Lillian Wittersheim","email":"lillian.wittersheim@haashall.org","googleId":"102257220364493835807","teamPosition":18051,"roomId":14,"isPlayer":true,"isMod":false,"isAdmin":false,"createdAt":"2022-03-25T23:37:20.745Z","updatedAt":"2022-03-26T15:42:40.580Z","teamId":70,"joined":false,"focused":false,"buzzing":false},{"id":554,"fullName":"Austin Parker","email":"austin.parker@haashall.org","googleId":"105855567785110782716","teamPosition":151535,"roomId":14,"isPlayer":true,"isMod":false,"isAdmin":false,"createdAt":"2022-03-26T13:11:04.698Z","updatedAt":"2022-03-26T15:42:40.580Z","teamId":70,"joined":false,"focused":false,"buzzing":false}],"Room":{"id":14,"roomName":"B-1","meetingLink":"https://prometheus.science/bohr106","createdAt":"2022-03-25T18:15:16.975Z","updatedAt":"2022-03-25T18:15:16.975Z"},"score":0,"lockedOut":false},{"id":103,"name":"MELHS","joinCode":"umkow6uko9zzjvj0zzvyb8yl6ctxgc7d","roomId":14,"createdAt":"2022-03-19T02:29:06.712Z","updatedAt":"2022-03-26T15:42:40.582Z","members":[{"id":284,"fullName":"Silas Curtis","email":"silas.curtis2023@melhs.org","googleId":"109715780803158010559","teamPosition":603758,"roomId":14,"isPlayer":true,"isMod":false,"isAdmin":false,"createdAt":"2022-03-21T13:07:12.634Z","updatedAt":"2022-03-26T15:42:40.582Z","teamId":103}],"Room":{"id":14,"roomName":"B-1","meetingLink":"https://prometheus.science/bohr106","createdAt":"2022-03-25T18:15:16.975Z","updatedAt":"2022-03-25T18:15:16.975Z"},"score":0}],"opened":false,"questionNum":0,"finished":false,"buzzActive":null,"onBonus":false,"scoreboard":{"questions":[[[],[]],[[],[]],[[],[]],[[],[]],[[],[]],[[],[]],[[],[]],[[],[]],[[],[]],[[],[]],[[],[]],[[],[]],[[],[]],[[],[]],[[],[]],[[],[]],[[],[]],[[],[]],[[],[]],[[],[]],[[],[]],[[],[]],[[],[]],[[],[]]],"whoBuzzed":[[null,null],[null,null],[null,null],[null,null],[null,null],[null,null],[null,null],[null,null],[null,null],[null,null],[null,null],[null,null],[null,null],[null,null],[null,null],[null,null],[null,null],[null,null],[null,null],[null,null],[null,null],[null,null],[null,null],[null,null]],"offsets":[0,0],"currentSize":24},"questionTimer":null,"timeUp":false,"timerRunning":false,"roundNum":1},"16":{"teams":[{"id":95,"name":"Horace Mann","joinCode":"hy8b8nsoxxgwg3ffuo6n20ehmobzh76r","roomId":16,"createdAt":"2022-03-19T02:26:57.883Z","updatedAt":"2022-03-26T15:42:40.581Z","members":[{"id":460,"fullName":"Sherlyn Almonte","email":"sherlyn_almonte@horacemann.org","googleId":"110730271272406456908","teamPosition":42911,"roomId":16,"isPlayer":true,"isMod":false,"isAdmin":false,"createdAt":"2022-03-25T22:54:17.381Z","updatedAt":"2022-03-26T15:42:40.581Z","teamId":95,"joined":false,"focused":false,"buzzing":false},{"id":402,"fullName":"Ben May","email":"benjamin_may@horacemann.org","googleId":"102315699715600287563","teamPosition":604593,"roomId":16,"isPlayer":true,"isMod":false,"isAdmin":false,"createdAt":"2022-03-24T22:58:32.066Z","updatedAt":"2022-03-26T15:42:40.581Z","teamId":95,"joined":true,"focused":true,"buzzing":false},{"id":301,"fullName":"Darson Chen","email":"darson_chen@horacemann.org","googleId":"114882769094597323836","teamPosition":989693,"roomId":16,"isPlayer":true,"isMod":false,"isAdmin":false,"createdAt":"2022-03-22T20:10:00.942Z","updatedAt":"2022-03-26T15:42:40.581Z","teamId":95,"joined":true,"focused":true,"buzzing":false}],"Room":{"id":16,"roomName":"B-3","meetingLink":"https://prometheus.science/bohr106","createdAt":"2022-03-25T18:15:16.975Z","updatedAt":"2022-03-25T18:15:16.975Z"},"score":0,"lockedOut":false},{"id":75,"name":"Lynbrook","joinCode":"34jad2qhd3nu7k7fbl5xi5li3f13v4d3","roomId":16,"createdAt":"2022-03-16T00:57:33.000Z","updatedAt":"2022-03-26T15:42:40.581Z","members":[{"id":532,"fullName":"Antone Jung","email":"antonejung1@gmail.com","googleId":"108498338045191476331","teamPosition":100208,"roomId":16,"isPlayer":true,"isMod":false,"isAdmin":false,"createdAt":"2022-03-26T05:16:31.748Z","updatedAt":"2022-03-26T15:42:40.581Z","teamId":75},{"id":456,"fullName":"Anirudh Bharadwaj","email":"bharadwaj.anirudh123@gmail.com","googleId":"109165698940643147855","teamPosition":717773,"roomId":16,"isPlayer":true,"isMod":false,"isAdmin":false,"createdAt":"2022-03-25T22:48:52.571Z","updatedAt":"2022-03-26T15:42:40.581Z","teamId":75,"joined":true,"focused":true},{"id":457,"fullName":"William Huang","email":"williamhuang678@gmail.com","googleId":"105105550293037363775","teamPosition":500934,"roomId":16,"isPlayer":true,"isMod":false,"isAdmin":false,"createdAt":"2022-03-25T22:49:43.143Z","updatedAt":"2022-03-26T15:42:40.581Z","teamId":75,"joined":true,"focused":true},{"id":120,"fullName":"David Lee","email":"leeweiming888@gmail.com","googleId":"104408870717380419808","teamPosition":289570,"roomId":16,"isPlayer":true,"isMod":false,"isAdmin":false,"createdAt":"2022-03-16T05:47:08.443Z","updatedAt":"2022-03-26T15:42:40.581Z","teamId":75,"joined":true,"focused":true}],"Room":{"id":16,"roomName":"B-3","meetingLink":"https://prometheus.science/bohr106","createdAt":"2022-03-25T18:15:16.975Z","updatedAt":"2022-03-25T18:15:16.975Z"},"score":0}],"opened":false,"questionNum":0,"finished":false,"buzzActive":null,"onBonus":false,"scoreboard":{"questions":[[[],[]],[[],[]],[[],[]],[[],[]],[[],[]],[[],[]],[[],[]],[[],[]],[[],[]],[[],[]],[[],[]],[[],[]],[[],[]],[[],[]],[[],[]],[[],[]],[[],[]],[[],[]],[[],[]],[[],[]],[[],[]],[[],[]],[[],[]],[[],[]]],"whoBuzzed":[[null,null],[null,null],[null,null],[null,null],[null,null],[null,null],[null,null],[null,null],[null,null],[null,null],[null,null],[null,null],[null,null],[null,null],[null,null],[null,null],[null,null],[null,null],[null,null],[null,null],[null,null],[null,null],[null,null],[null,null]],"offsets":[0,0],"currentSize":24},"questionTimer":null,"timeUp":false,"timerRunning":false,"roundNum":1},"17":{"teams":[{"id":12,"name":"Enloe A","joinCode":"j64qgymkbtcbblydck382wf2klb5to5v","roomId":17,"createdAt":"2022-03-16T00:57:33.000Z","updatedAt":"2022-03-26T15:42:40.583Z","members":[{"id":507,"fullName":"Nikhil Vemuri","email":"nvemuri4649@gmail.com","googleId":"100470170067790288852","teamPosition":404873,"roomId":17,"isPlayer":true,"isMod":false,"isAdmin":false,"createdAt":"2022-03-26T02:46:46.235Z","updatedAt":"2022-03-26T15:42:40.583Z","teamId":12,"joined":true,"focused":true,"buzzing":false},{"id":139,"fullName":"Rishabh Bedidha","email":"rishabh.bedidha2005@gmail.com","googleId":"103709610629741383646","teamPosition":269291,"roomId":17,"isPlayer":true,"isMod":false,"isAdmin":false,"createdAt":"2022-03-16T12:22:05.634Z","updatedAt":"2022-03-26T15:42:40.583Z","teamId":12,"joined":true,"focused":true,"buzzing":false},{"id":165,"fullName":"Brian Zhang","email":"brianzjk@gmail.com","googleId":"116456338627108780396","teamPosition":30359,"roomId":17,"isPlayer":true,"isMod":false,"isAdmin":false,"createdAt":"2022-03-16T20:15:29.222Z","updatedAt":"2022-03-26T15:42:40.583Z","teamId":12,"joined":true,"focused":true,"buzzing":false},{"id":341,"fullName":"Colin Hanes","email":"coolwolfs8@gmail.com","googleId":"107077468607348826234","teamPosition":609382,"roomId":17,"isPlayer":true,"isMod":false,"isAdmin":false,"createdAt":"2022-03-23T18:11:05.156Z","updatedAt":"2022-03-26T15:42:40.583Z","teamId":12,"joined":true,"focused":true,"buzzing":false},{"id":201,"fullName":"Rohit Hari","email":"bob.omjoe@gmail.com","googleId":"107031227865195095099","teamPosition":797210,"roomId":17,"isPlayer":true,"isMod":false,"isAdmin":false,"createdAt":"2022-03-17T18:57:54.139Z","updatedAt":"2022-03-26T15:42:40.583Z","teamId":12,"joined":false,"focused":false,"buzzing":false}],"Room":{"id":17,"roomName":"C-1","meetingLink":"https://prometheus.science/curie572","createdAt":"2022-03-25T18:15:16.975Z","updatedAt":"2022-03-25T18:15:16.975Z"},"score":0,"lockedOut":false},{"id":34,"name":"Venice","joinCode":"ayhb6dt7t86ethbz0bm4ua4konyjdtn9","roomId":17,"createdAt":"2022-03-16T00:57:33.000Z","updatedAt":"2022-03-26T15:42:40.587Z","members":[{"id":414,"fullName":"michael warsono","email":"michael.j.warsono@gmail.com","googleId":"107171641803497272922","teamPosition":727782,"roomId":17,"isPlayer":true,"isMod":false,"isAdmin":false,"createdAt":"2022-03-25T01:18:03.560Z","updatedAt":"2022-03-26T15:42:40.587Z","teamId":34,"joined":true,"focused":true},{"id":375,"fullName":"Lidia P","email":"lidsofia@gmail.com","googleId":"110835626147750924304","teamPosition":910214,"roomId":17,"isPlayer":true,"isMod":false,"isAdmin":false,"createdAt":"2022-03-24T04:47:00.370Z","updatedAt":"2022-03-26T15:42:40.587Z","teamId":34,"joined":true,"focused":true},{"id":476,"fullName":"NOLAN KUO","email":"nkuo0001@mymail.lausd.net","googleId":"112524646100475210928","teamPosition":746711,"roomId":17,"isPlayer":true,"isMod":false,"isAdmin":false,"createdAt":"2022-03-26T00:13:24.250Z","updatedAt":"2022-03-26T15:42:40.587Z","teamId":34,"joined":true,"focused":true},{"id":264,"fullName":"Thaddeus Stefanski-Hall","email":"thaddeus.stefanskihall@gmail.com","googleId":"107042395165060849928","teamPosition":420424,"roomId":17,"isPlayer":true,"isMod":false,"isAdmin":false,"createdAt":"2022-03-20T05:07:30.614Z","updatedAt":"2022-03-26T15:42:40.587Z","teamId":34,"joined":true,"focused":true},{"id":403,"fullName":"Fateh A. [Venice]","email":"faliyer0001@mymail.lausd.net","googleId":"109712605283913221082","teamPosition":359127,"roomId":17,"isPlayer":true,"isMod":false,"isAdmin":false,"createdAt":"2022-03-24T23:03:00.105Z","updatedAt":"2022-03-26T15:42:40.587Z","teamId":34,"joined":true,"focused":true}],"Room":{"id":17,"roomName":"C-1","meetingLink":"https://prometheus.science/curie572","createdAt":"2022-03-25T18:15:16.975Z","updatedAt":"2022-03-25T18:15:16.975Z"},"score":0}],"opened":true,"questionNum":0,"finished":false,"buzzActive":null,"onBonus":false,"scoreboard":{"questions":[[[],[]],[[],[]],[[],[]],[[],[]],[[],[]],[[],[]],[[],[]],[[],[]],[[],[]],[[],[]],[[],[]],[[],[]],[[],[]],[[],[]],[[],[]],[[],[]],[[],[]],[[],[]],[[],[]],[[],[]],[[],[]],[[],[]],[[],[]],[[],[]]],"whoBuzzed":[[null,null],[null,null],[null,null],[null,null],[null,null],[null,null],[null,null],[null,null],[null,null],[null,null],[null,null],[null,null],[null,null],[null,null],[null,null],[null,null],[null,null],[null,null],[null,null],[null,null],[null,null],[null,null],[null,null],[null,null]],"offsets":[0,0],"currentSize":24},"questionTimer":null,"timeUp":false,"timerRunning":false,"roundNum":1},"18":{"teams":[{"id":94,"name":"BRHS A","joinCode":"hvdx611bz5btwjyjymmkkaxq6fdv1rds","roomId":18,"createdAt":"2022-03-19T02:26:32.516Z","updatedAt":"2022-03-26T15:42:40.585Z","members":[{"id":292,"fullName":"Matthew Q","email":"awesomematt1221@gmail.com","googleId":"111581809742913712128","teamPosition":559566,"roomId":18,"isPlayer":true,"isMod":false,"isAdmin":false,"createdAt":"2022-03-21T23:24:01.040Z","updatedAt":"2022-03-26T15:42:40.585Z","teamId":94,"joined":false,"focused":false,"buzzing":false},{"id":270,"fullName":"Sid Ganapathy","email":"sidgthepidgey@gmail.com","googleId":"104631933502425612473","teamPosition":91301,"roomId":18,"isPlayer":true,"isMod":false,"isAdmin":false,"createdAt":"2022-03-20T13:17:28.170Z","updatedAt":"2022-03-26T15:42:40.585Z","teamId":94,"joined":false,"focused":false,"buzzing":false},{"id":299,"fullName":"Shaunak Gaiki","email":"shaunak.gaiki@gmail.com","googleId":"114121986501644340200","teamPosition":304222,"roomId":18,"isPlayer":true,"isMod":false,"isAdmin":false,"createdAt":"2022-03-22T15:56:49.836Z","updatedAt":"2022-03-26T15:42:40.585Z","teamId":94,"joined":true,"focused":true,"buzzing":false},{"id":281,"fullName":"Anuraag Pandhi","email":"anumon6395@gmail.com","googleId":"103203285567512181391","teamPosition":126649,"roomId":18,"isPlayer":true,"isMod":false,"isAdmin":false,"createdAt":"2022-03-21T03:55:58.894Z","updatedAt":"2022-03-26T15:42:40.585Z","teamId":94,"joined":false,"focused":false,"buzzing":false},{"id":296,"fullName":"Eric Zou","email":"undertroll2017@gmail.com","googleId":"107442460889111750984","teamPosition":20094,"roomId":18,"isPlayer":true,"isMod":false,"isAdmin":false,"createdAt":"2022-03-22T01:23:02.532Z","updatedAt":"2022-03-26T15:42:40.585Z","teamId":94,"joined":true,"focused":true,"buzzing":false}],"Room":{"id":18,"roomName":"C-2","meetingLink":"https://prometheus.science/curie572","createdAt":"2022-03-25T18:15:16.975Z","updatedAt":"2022-03-25T18:15:16.975Z"},"score":0,"lockedOut":false},{"id":77,"name":"WWP North","joinCode":"kjgbun859kn981504xbaeyi41vfac6li","roomId":18,"createdAt":"2022-03-16T00:57:33.000Z","updatedAt":"2022-03-26T15:42:40.590Z","members":[{"id":330,"fullName":"Harshit Kolisetty","email":"harshkolisetty@gmail.com","googleId":"106596514912471226104","teamPosition":25453,"roomId":18,"isPlayer":true,"isMod":false,"isAdmin":false,"createdAt":"2022-03-23T16:45:52.283Z","updatedAt":"2022-03-26T15:42:40.590Z","teamId":77,"joined":true,"focused":true},{"id":401,"fullName":"Krutarth Vaddiyar","email":"kittalu4u@gmail.com","googleId":"107799769413037396453","teamPosition":56258,"roomId":18,"isPlayer":true,"isMod":false,"isAdmin":false,"createdAt":"2022-03-24T22:31:03.780Z","updatedAt":"2022-03-26T15:42:40.590Z","teamId":77,"joined":true,"focused":true},{"id":482,"fullName":"Shreyash Singh","email":"shreyash.r.singh@gmail.com","googleId":"114625054951386147826","teamPosition":701996,"roomId":18,"isPlayer":true,"isMod":false,"isAdmin":false,"createdAt":"2022-03-26T00:43:37.223Z","updatedAt":"2022-03-26T15:42:40.590Z","teamId":77,"joined":true,"focused":true},{"id":518,"fullName":"Arvyn De","email":"arvynd.26@gmail.com","googleId":"111165689725968807795","teamPosition":866845,"roomId":18,"isPlayer":true,"isMod":false,"isAdmin":false,"createdAt":"2022-03-26T03:41:17.151Z","updatedAt":"2022-03-26T15:42:40.590Z","teamId":77,"joined":true,"focused":true},{"id":519,"fullName":"Srivant Pothuraju","email":"sripothuraju1@gmail.com","googleId":"115951772753099951840","teamPosition":121813,"roomId":18,"isPlayer":true,"isMod":false,"isAdmin":false,"createdAt":"2022-03-26T03:45:13.886Z","updatedAt":"2022-03-26T15:42:40.590Z","teamId":77}],"Room":{"id":18,"roomName":"C-2","meetingLink":"https://prometheus.science/curie572","createdAt":"2022-03-25T18:15:16.975Z","updatedAt":"2022-03-25T18:15:16.975Z"},"score":0}],"opened":false,"questionNum":0,"finished":false,"buzzActive":null,"onBonus":false,"scoreboard":{"questions":[[[],[]],[[],[]],[[],[]],[[],[]],[[],[]],[[],[]],[[],[]],[[],[]],[[],[]],[[],[]],[[],[]],[[],[]],[[],[]],[[],[]],[[],[]],[[],[]],[[],[]],[[],[]],[[],[]],[[],[]],[[],[]],[[],[]],[[],[]],[[],[]]],"whoBuzzed":[[null,null],[null,null],[null,null],[null,null],[null,null],[null,null],[null,null],[null,null],[null,null],[null,null],[null,null],[null,null],[null,null],[null,null],[null,null],[null,null],[null,null],[null,null],[null,null],[null,null],[null,null],[null,null],[null,null],[null,null]],"offsets":[0,0],"currentSize":24},"questionTimer":null,"timeUp":false,"timerRunning":false,"roundNum":1},"19":{"teams":[{"id":104,"name":"Lindbergh","joinCode":"pdvgr4z9ifvg5xqammsduek0n9v3gqmx","roomId":19,"createdAt":"2022-03-19T02:29:17.950Z","updatedAt":"2022-03-26T15:42:40.584Z","members":[{"id":336,"fullName":"Isaac Gutierrez","email":"24isaacgutierrez@lindberghschools.ws","googleId":"118033460152470273571","teamPosition":881135,"roomId":19,"isPlayer":true,"isMod":false,"isAdmin":false,"createdAt":"2022-03-23T17:40:32.140Z","updatedAt":"2022-03-26T15:42:40.584Z","teamId":104,"joined":true,"focused":true,"buzzing":false},{"id":291,"fullName":"Alex Sheahan","email":"23alexsheahan@lindberghschools.ws","googleId":"101773934085515589185","teamPosition":77402,"roomId":19,"isPlayer":true,"isMod":false,"isAdmin":false,"createdAt":"2022-03-21T19:04:08.969Z","updatedAt":"2022-03-26T15:42:40.584Z","teamId":104,"joined":true,"focused":true,"buzzing":false},{"id":261,"fullName":"Cindy Yao","email":"24cindyyao@lindberghschools.ws","googleId":"107424834281416194083","teamPosition":149829,"roomId":19,"isPlayer":true,"isMod":false,"isAdmin":false,"createdAt":"2022-03-20T04:13:34.364Z","updatedAt":"2022-03-26T15:42:40.584Z","teamId":104,"joined":true,"focused":true,"buzzing":false},{"id":326,"fullName":"Chinmay Kumar","email":"24chinmaykumar@lindberghschools.ws","googleId":"116177563707437015100","teamPosition":278280,"roomId":19,"isPlayer":true,"isMod":false,"isAdmin":false,"createdAt":"2022-03-23T16:04:18.874Z","updatedAt":"2022-03-26T15:42:40.584Z","teamId":104,"joined":true,"focused":true,"buzzing":false},{"id":501,"fullName":"Vidur Kothur","email":"26vidurkothur@lindberghschools.ws","googleId":"106442958599386378471","teamPosition":906889,"roomId":19,"isPlayer":true,"isMod":false,"isAdmin":false,"createdAt":"2022-03-26T02:11:31.270Z","updatedAt":"2022-03-26T15:42:40.584Z","teamId":104,"joined":true,"focused":true,"buzzing":false}],"Room":{"id":19,"roomName":"C-3","meetingLink":"https://prometheus.science/curie572","createdAt":"2022-03-25T18:15:16.975Z","updatedAt":"2022-03-25T18:15:16.975Z"},"score":0,"lockedOut":false},{"id":88,"name":"RMHS B","joinCode":"nb442vbf9h4xyxmtja8el6wyjcika8xz","roomId":19,"createdAt":"2022-03-16T00:57:33.000Z","updatedAt":"2022-03-26T15:42:40.586Z","members":[{"id":569,"fullName":"Ami Mundra","email":"amimundra@gmail.com","googleId":"105978624237807255810","teamPosition":276864,"roomId":19,"isPlayer":true,"isMod":false,"isAdmin":false,"createdAt":"2022-03-26T15:14:31.772Z","updatedAt":"2022-03-26T15:42:40.586Z","teamId":88,"joined":true,"focused":true},{"id":363,"fullName":"Fotie Tiam","email":"fotietiam1@gmail.com","googleId":"106825581272215550736","teamPosition":81109,"roomId":19,"isPlayer":true,"isMod":false,"isAdmin":false,"createdAt":"2022-03-24T01:52:58.415Z","updatedAt":"2022-03-26T15:42:40.586Z","teamId":88,"joined":true,"focused":true},{"id":415,"fullName":"Cas Nguyen","email":"cassketchmurp@gmail.com","googleId":"113421107077105297490","teamPosition":395488,"roomId":19,"isPlayer":true,"isMod":false,"isAdmin":false,"createdAt":"2022-03-25T01:28:52.952Z","updatedAt":"2022-03-26T15:42:40.586Z","teamId":88,"joined":true,"focused":true}],"Room":{"id":19,"roomName":"C-3","meetingLink":"https://prometheus.science/curie572","createdAt":"2022-03-25T18:15:16.975Z","updatedAt":"2022-03-25T18:15:16.975Z"},"score":0}],"opened":false,"questionNum":0,"finished":false,"buzzActive":null,"onBonus":false,"scoreboard":{"questions":[[[],[]],[[],[]],[[],[]],[[],[]],[[],[]],[[],[]],[[],[]],[[],[]],[[],[]],[[],[]],[[],[]],[[],[]],[[],[]],[[],[]],[[],[]],[[],[]],[[],[]],[[],[]],[[],[]],[[],[]],[[],[]],[[],[]],[[],[]],[[],[]]],"whoBuzzed":[[null,null],[null,null],[null,null],[null,null],[null,null],[null,null],[null,null],[null,null],[null,null],[null,null],[null,null],[null,null],[null,null],[null,null],[null,null],[null,null],[null,null],[null,null],[null,null],[null,null],[null,null],[null,null],[null,null],[null,null]],"offsets":[0,0],"currentSize":24},"questionTimer":null,"timeUp":false,"timerRunning":false,"roundNum":1},"20":{"teams":[{"id":100,"name":"BRHS B","joinCode":"212ibe2gyl79u10ve9oe4b1ahq1m5gf1","roomId":20,"createdAt":"2022-03-19T02:28:01.344Z","updatedAt":"2022-03-26T15:42:40.588Z","members":[{"id":267,"fullName":"Akhil Kalepalli","email":"akhil.kalepalli7@gmail.com","googleId":"103611190822613681269","teamPosition":629697,"roomId":20,"isPlayer":true,"isMod":false,"isAdmin":false,"createdAt":"2022-03-20T06:54:53.570Z","updatedAt":"2022-03-26T15:42:40.588Z","teamId":100,"joined":false,"focused":false,"buzzing":false},{"id":471,"fullName":"Karthik Angara","email":"mail2kangara@gmail.com","googleId":"110148340064637033304","teamPosition":581042,"roomId":20,"isPlayer":true,"isMod":false,"isAdmin":false,"createdAt":"2022-03-25T23:41:54.390Z","updatedAt":"2022-03-26T15:42:40.588Z","teamId":100,"joined":false,"focused":false,"buzzing":false}],"Room":{"id":20,"roomName":"D-1","meetingLink":"https://prometheus.science/darwin133","createdAt":"2022-03-25T18:15:16.975Z","updatedAt":"2022-03-25T18:15:16.975Z"},"score":0,"lockedOut":false},{"id":90,"name":"Miramonte","joinCode":"ejjpko8ptze1wnt7n4d3y6yg7m9b6jbu","roomId":20,"createdAt":"2022-03-16T00:57:33.000Z","updatedAt":"2022-03-26T15:42:40.593Z","members":[{"id":129,"fullName":"Sheng Shu","email":"sheng.shu22@auhsdschools.org","googleId":"113550319724211374933","teamPosition":750126,"roomId":20,"isPlayer":true,"isMod":false,"isAdmin":false,"createdAt":"2022-03-16T07:29:29.125Z","updatedAt":"2022-03-26T15:42:40.593Z","teamId":90,"joined":true,"focused":true},{"id":182,"fullName":"Brian Hu","email":"brian.hu22@auhsdschools.org","googleId":"102705574145603372853","teamPosition":129513,"roomId":20,"isPlayer":true,"isMod":false,"isAdmin":false,"createdAt":"2022-03-17T01:08:02.820Z","updatedAt":"2022-03-26T15:42:40.593Z","teamId":90,"joined":true,"focused":true},{"id":317,"fullName":"Alex Aoki","email":"alexander.aoki23@auhsdschools.org","googleId":"110283267586428546423","teamPosition":389292,"roomId":20,"isPlayer":true,"isMod":false,"isAdmin":false,"createdAt":"2022-03-23T03:12:46.514Z","updatedAt":"2022-03-26T15:42:40.593Z","teamId":90,"joined":true,"focused":true},{"id":497,"fullName":"Steven Lee","email":"steven.lee24@auhsdschools.org","googleId":"100497421760589124476","teamPosition":204949,"roomId":20,"isPlayer":true,"isMod":false,"isAdmin":false,"createdAt":"2022-03-26T02:07:15.408Z","updatedAt":"2022-03-26T15:42:40.593Z","teamId":90,"joined":true,"focused":true},{"id":466,"fullName":"Paul Stephan","email":"paul.stephan24@auhsdschools.org","googleId":"116445159227731457474","teamPosition":733917,"roomId":20,"isPlayer":true,"isMod":false,"isAdmin":false,"createdAt":"2022-03-25T23:11:25.391Z","updatedAt":"2022-03-26T15:42:40.593Z","teamId":90,"joined":true,"focused":true}],"Room":{"id":20,"roomName":"D-1","meetingLink":"https://prometheus.science/darwin133","createdAt":"2022-03-25T18:15:16.975Z","updatedAt":"2022-03-25T18:15:16.975Z"},"score":0}],"opened":false,"questionNum":0,"finished":false,"buzzActive":null,"onBonus":false,"scoreboard":{"questions":[[[],[]],[[],[]],[[],[]],[[],[]],[[],[]],[[],[]],[[],[]],[[],[]],[[],[]],[[],[]],[[],[]],[[],[]],[[],[]],[[],[]],[[],[]],[[],[]],[[],[]],[[],[]],[[],[]],[[],[]],[[],[]],[[],[]],[[],[]],[[],[]]],"whoBuzzed":[[null,null],[null,null],[null,null],[null,null],[null,null],[null,null],[null,null],[null,null],[null,null],[null,null],[null,null],[null,null],[null,null],[null,null],[null,null],[null,null],[null,null],[null,null],[null,null],[null,null],[null,null],[null,null],[null,null],[null,null]],"offsets":[0,0],"currentSize":24},"questionTimer":null,"timeUp":false,"timerRunning":false,"roundNum":1},"22":{"teams":[{"id":19,"name":"Cupertino","joinCode":"4a69xi0cpt6deth5dcnj61k2dggdhtlr","roomId":22,"createdAt":"2022-03-16T00:57:33.000Z","updatedAt":"2022-03-26T15:42:40.589Z","members":[{"id":237,"fullName":"Jake Wang","email":"jake434546@gmail.com","googleId":"110844812019204409144","teamPosition":953374,"roomId":22,"isPlayer":true,"isMod":false,"isAdmin":false,"createdAt":"2022-03-19T20:29:47.190Z","updatedAt":"2022-03-26T15:42:40.589Z","teamId":19,"joined":false,"focused":false,"buzzing":false},{"id":172,"fullName":"Gilford Ting","email":"gilfordting@gmail.com","googleId":"115760976429538552976","teamPosition":947354,"roomId":22,"isPlayer":true,"isMod":false,"isAdmin":false,"createdAt":"2022-03-16T22:59:40.021Z","updatedAt":"2022-03-26T15:42:40.589Z","teamId":19,"joined":true,"focused":true,"buzzing":false},{"id":239,"fullName":"Aaditya Karnataki","email":"aaditya@live.com","googleId":"115537153154480928573","teamPosition":288758,"roomId":22,"isPlayer":true,"isMod":false,"isAdmin":false,"createdAt":"2022-03-19T21:54:16.129Z","updatedAt":"2022-03-26T15:42:40.589Z","teamId":19,"joined":true,"focused":true,"buzzing":false},{"id":232,"fullName":"Minseo Park","email":"minseo.park06@gmail.com","googleId":"106319120270359608405","teamPosition":555599,"roomId":22,"isPlayer":true,"isMod":false,"isAdmin":false,"createdAt":"2022-03-19T20:10:48.435Z","updatedAt":"2022-03-26T15:42:40.589Z","teamId":19,"joined":false,"focused":false,"buzzing":false},{"id":236,"fullName":"Aditi Gargeshwari","email":"agargeshwari23@gmail.com","googleId":"112662809733132075388","teamPosition":585908,"roomId":22,"isPlayer":true,"isMod":false,"isAdmin":false,"createdAt":"2022-03-19T20:17:13.705Z","updatedAt":"2022-03-26T15:42:40.589Z","teamId":19,"joined":false,"focused":false,"buzzing":false}],"Room":{"id":22,"roomName":"D-3","meetingLink":"https://prometheus.science/darwin133","createdAt":"2022-03-25T18:15:16.975Z","updatedAt":"2022-03-25T18:15:16.975Z"},"score":0,"lockedOut":false},{"id":114,"name":"Dougherty B","joinCode":"y647nnm3kngk2i6rqul7li82ej6izc4b","roomId":22,"createdAt":"2022-03-22T23:17:10.107Z","updatedAt":"2022-03-26T15:42:40.592Z","members":[{"id":522,"fullName":"Aryan Bammi (DH)","email":"240544@students.srvusd.net","googleId":"111723871273954063744","teamPosition":989611,"roomId":22,"isPlayer":true,"isMod":false,"isAdmin":false,"createdAt":"2022-03-26T04:10:34.410Z","updatedAt":"2022-03-26T15:42:40.592Z","teamId":114,"joined":true,"focused":true},{"id":374,"fullName":"Lawrence Chau","email":"maniac1745@gmail.com","googleId":"103252730141347993724","teamPosition":300787,"roomId":22,"isPlayer":true,"isMod":false,"isAdmin":false,"createdAt":"2022-03-24T04:39:24.203Z","updatedAt":"2022-03-26T15:42:40.592Z","teamId":114,"joined":true,"focused":true},{"id":428,"fullName":"Kiruthika Marikumaran","email":"kiruthikamarikumaran@gmail.com","googleId":"102968344143667223955","teamPosition":814288,"roomId":22,"isPlayer":true,"isMod":false,"isAdmin":false,"createdAt":"2022-03-25T05:33:20.939Z","updatedAt":"2022-03-26T15:42:40.592Z","teamId":114,"joined":true,"focused":true},{"id":557,"fullName":"Rahul Pothi Vinoth Bala Nagaraj (DH)","email":"218001@students.srvusd.net","googleId":"109095481657053167107","teamPosition":649583,"roomId":22,"isPlayer":true,"isMod":false,"isAdmin":false,"createdAt":"2022-03-26T14:03:55.689Z","updatedAt":"2022-03-26T15:42:40.592Z","teamId":114,"joined":true,"focused":true},{"id":427,"fullName":"Kiruthika Marikumaran (DVHS)","email":"219295@students.srvusd.net","googleId":"106282303277489409422","teamPosition":84466,"roomId":22,"isPlayer":true,"isMod":false,"isAdmin":false,"createdAt":"2022-03-25T05:14:08.230Z","updatedAt":"2022-03-26T15:42:40.592Z","teamId":114}],"Room":{"id":22,"roomName":"D-3","meetingLink":"https://prometheus.science/darwin133","createdAt":"2022-03-25T18:15:16.975Z","updatedAt":"2022-03-25T18:15:16.975Z"},"score":0}],"opened":false,"questionNum":0,"finished":false,"buzzActive":null,"onBonus":false,"scoreboard":{"questions":[[[],[]],[[],[]],[[],[]],[[],[]],[[],[]],[[],[]],[[],[]],[[],[]],[[],[]],[[],[]],[[],[]],[[],[]],[[],[]],[[],[]],[[],[]],[[],[]],[[],[]],[[],[]],[[],[]],[[],[]],[[],[]],[[],[]],[[],[]],[[],[]]],"whoBuzzed":[[null,null],[null,null],[null,null],[null,null],[null,null],[null,null],[null,null],[null,null],[null,null],[null,null],[null,null],[null,null],[null,null],[null,null],[null,null],[null,null],[null,null],[null,null],[null,null],[null,null],[null,null],[null,null],[null,null],[null,null]],"offsets":[0,0],"currentSize":24},"questionTimer":null,"timeUp":false,"timerRunning":false,"roundNum":1},"23":{"teams":[{"id":129,"name":"Olympia","joinCode":"d2papy0fq60t6tlqcd8gz8g0r0iwnh73","roomId":23,"createdAt":"2022-03-23T01:52:32.640Z","updatedAt":"2022-03-26T15:42:40.591Z","members":[{"id":320,"fullName":"Graham Christenson","email":"christensongt@students.osd.wednet.edu","googleId":"110801777825250283780","teamPosition":616647,"roomId":23,"isPlayer":true,"isMod":false,"isAdmin":false,"createdAt":"2022-03-23T04:53:37.821Z","updatedAt":"2022-03-26T15:42:40.591Z","teamId":129,"joined":true,"focused":true,"buzzing":false},{"id":582,"fullName":"Jonathan Holcombe","email":"holcombejr@students.osd.wednet.edu","googleId":"115776869400654581089","teamPosition":643936,"roomId":23,"isPlayer":true,"isMod":false,"isAdmin":false,"createdAt":"2022-03-26T15:27:48.005Z","updatedAt":"2022-03-26T15:42:40.591Z","teamId":129,"joined":true,"focused":true,"buzzing":false},{"id":314,"fullName":"David Gunderson","email":"gundersondf@students.osd.wednet.edu","googleId":"102687963101517290545","teamPosition":233016,"roomId":23,"isPlayer":true,"isMod":false,"isAdmin":false,"createdAt":"2022-03-23T02:12:17.005Z","updatedAt":"2022-03-26T15:42:40.591Z","teamId":129,"joined":true,"focused":true,"buzzing":false},{"id":440,"fullName":"Antony Ponomarev","email":"ponomarevan@students.osd.wednet.edu","googleId":"102110770950607935915","teamPosition":848510,"roomId":23,"isPlayer":true,"isMod":false,"isAdmin":false,"createdAt":"2022-03-25T15:55:34.600Z","updatedAt":"2022-03-26T15:42:40.591Z","teamId":129,"joined":false,"focused":false,"buzzing":false},{"id":338,"fullName":"Jonathan Holcombe","email":"jonathan.holcombe@gmail.com","googleId":"101431499533159952544","teamPosition":442621,"roomId":23,"isPlayer":true,"isMod":false,"isAdmin":false,"createdAt":"2022-03-23T17:58:19.418Z","updatedAt":"2022-03-26T15:42:40.591Z","teamId":129,"joined":false,"focused":false,"buzzing":false},{"id":450,"fullName":"Lucas Qiu","email":"qiult@students.osd.wednet.edu","googleId":"108103913113042806564","teamPosition":505695,"roomId":23,"isPlayer":true,"isMod":false,"isAdmin":false,"createdAt":"2022-03-25T21:07:32.929Z","updatedAt":"2022-03-26T15:42:40.591Z","teamId":129,"joined":true,"focused":true,"buzzing":false}],"Room":{"id":23,"roomName":"E-1","meetingLink":"https://prometheus.science/einstein456","createdAt":"2022-03-25T18:15:16.975Z","updatedAt":"2022-03-25T18:15:16.975Z"},"score":0,"lockedOut":false},{"id":28,"name":"Stanford OHS A","joinCode":"jusjmb6q1xd30c1wip01mghvfay0n1fm","roomId":23,"createdAt":"2022-03-16T00:57:33.000Z","updatedAt":"2022-03-26T15:42:40.598Z","members":[{"id":241,"fullName":"Victoria","email":"klassicalkeys@gmail.com","googleId":"117114720944078925477","teamPosition":333148,"roomId":23,"isPlayer":true,"isMod":false,"isAdmin":false,"createdAt":"2022-03-19T21:59:26.062Z","updatedAt":"2022-03-26T15:42:40.598Z","teamId":28,"joined":true,"focused":true},{"id":122,"fullName":"Katherine Viala","email":"kndviala@gmail.com","googleId":"103540512860524155775","teamPosition":580141,"roomId":23,"isPlayer":true,"isMod":false,"isAdmin":false,"createdAt":"2022-03-16T05:50:21.651Z","updatedAt":"2022-03-26T15:42:40.598Z","teamId":28,"joined":true,"focused":true},{"id":160,"fullName":"Arhan Surapaneni","email":"surapaneniarhan@gmail.com","googleId":"113613993468628676194","teamPosition":856673,"roomId":23,"isPlayer":true,"isMod":false,"isAdmin":false,"createdAt":"2022-03-16T19:00:50.681Z","updatedAt":"2022-03-26T15:42:40.598Z","teamId":28,"joined":true,"focused":true}],"Room":{"id":23,"roomName":"E-1","meetingLink":"https://prometheus.science/einstein456","createdAt":"2022-03-25T18:15:16.975Z","updatedAt":"2022-03-25T18:15:16.975Z"},"score":0}],"opened":true,"questionNum":0,"finished":false,"buzzActive":null,"onBonus":false,"scoreboard":{"questions":[[[],[]],[[],[]],[[],[]],[[],[]],[[],[]],[[],[]],[[],[]],[[],[]],[[],[]],[[],[]],[[],[]],[[],[]],[[],[]],[[],[]],[[],[]],[[],[]],[[],[]],[[],[]],[[],[]],[[],[]],[[],[]],[[],[]],[[],[]],[[],[]]],"whoBuzzed":[[null,null],[null,null],[null,null],[null,null],[null,null],[null,null],[null,null],[null,null],[null,null],[null,null],[null,null],[null,null],[null,null],[null,null],[null,null],[null,null],[null,null],[null,null],[null,null],[null,null],[null,null],[null,null],[null,null],[null,null]],"offsets":[0,0],"currentSize":24},"questionTimer":null,"timeUp":false,"timerRunning":false,"roundNum":1,"answeringTeam":null},"24":{"teams":[{"id":79,"name":"Mira Loma B","joinCode":"5vsk95c6rciq6mpv4oyx49omvc5fbg48","roomId":24,"createdAt":"2022-03-16T00:57:33.000Z","updatedAt":"2022-03-26T15:42:40.590Z","members":[{"id":225,"fullName":"Tanay Bodducherla","email":"tanay.bodducherla@gmail.com","googleId":"104511857744897181126","teamPosition":401918,"roomId":24,"isPlayer":true,"isMod":false,"isAdmin":false,"createdAt":"2022-03-19T02:22:54.961Z","updatedAt":"2022-03-26T15:42:40.590Z","teamId":79,"joined":true,"focused":true,"buzzing":false},{"id":227,"fullName":"Elyas Nuh (MLB)","email":"nuhelyas6@gmail.com","googleId":"113357206657664826750","teamPosition":571447,"roomId":24,"isPlayer":true,"isMod":false,"isAdmin":false,"createdAt":"2022-03-19T02:47:25.733Z","updatedAt":"2022-03-26T15:42:40.590Z","teamId":79,"joined":true,"focused":true,"buzzing":false},{"id":226,"fullName":"Ashrith B","email":"ashriththeboss@gmail.com","googleId":"104954023833537563417","teamPosition":687954,"roomId":24,"isPlayer":true,"isMod":false,"isAdmin":false,"createdAt":"2022-03-19T02:33:27.346Z","updatedAt":"2022-03-26T15:42:40.590Z","teamId":79,"joined":true,"focused":true,"buzzing":false},{"id":148,"fullName":"Harish Premkumar","email":"harishpremkumar06@gmail.com","googleId":"100590880042395963339","teamPosition":244506,"roomId":24,"isPlayer":true,"isMod":false,"isAdmin":false,"createdAt":"2022-03-16T14:16:51.409Z","updatedAt":"2022-03-26T15:42:40.590Z","teamId":79,"joined":true,"focused":true,"buzzing":false},{"id":230,"fullName":"Vishwas Charan","email":"tovishwasc@gmail.com","googleId":"102769354713527721660","teamPosition":109516,"roomId":24,"isPlayer":true,"isMod":false,"isAdmin":false,"createdAt":"2022-03-19T17:37:29.978Z","updatedAt":"2022-03-26T15:42:40.590Z","teamId":79,"joined":true,"focused":true,"buzzing":false}],"Room":{"id":24,"roomName":"E-2","meetingLink":"https://prometheus.science/einstein456","createdAt":"2022-03-25T18:15:16.975Z","updatedAt":"2022-03-25T18:15:16.975Z"},"score":0,"lockedOut":false},{"id":37,"name":"Van Nuys","joinCode":"0cc1hpzpdxaxypaekyr8pkv47o9jamja","roomId":24,"createdAt":"2022-03-16T00:57:33.000Z","updatedAt":"2022-03-26T15:42:40.594Z","members":[{"id":504,"fullName":"RYAN LIMPASURAT","email":"rlimpasur0001@mymail.lausd.net","googleId":"101855033029536052060","teamPosition":964186,"roomId":24,"isPlayer":true,"isMod":false,"isAdmin":false,"createdAt":"2022-03-26T02:43:01.391Z","updatedAt":"2022-03-26T15:42:40.594Z","teamId":37,"joined":true,"focused":true},{"id":486,"fullName":"DRISHTI REGMI","email":"dregmi0001@mymail.lausd.net","googleId":"107627806612635425891","teamPosition":367290,"roomId":24,"isPlayer":true,"isMod":false,"isAdmin":false,"createdAt":"2022-03-26T01:25:49.033Z","updatedAt":"2022-03-26T15:42:40.594Z","teamId":37,"joined":true,"focused":true},{"id":570,"fullName":"SHAHEN AKOPYAN","email":"sakopyan0007@mymail.lausd.net","googleId":"112829155223885559569","teamPosition":411565,"roomId":24,"isPlayer":true,"isMod":false,"isAdmin":false,"createdAt":"2022-03-26T15:14:47.620Z","updatedAt":"2022-03-26T15:42:40.594Z","teamId":37,"joined":true,"focused":true},{"id":488,"fullName":"Srijesh","email":"perryplatypus134@gmail.com","googleId":"115107631805010322473","teamPosition":362531,"roomId":24,"isPlayer":true,"isMod":false,"isAdmin":false,"createdAt":"2022-03-26T01:44:32.190Z","updatedAt":"2022-03-26T15:42:40.594Z","teamId":37,"joined":true,"focused":true}],"Room":{"id":24,"roomName":"E-2","meetingLink":"https://prometheus.science/einstein456","createdAt":"2022-03-25T18:15:16.975Z","updatedAt":"2022-03-25T18:15:16.975Z"},"score":0}],"opened":false,"questionNum":0,"finished":false,"buzzActive":null,"onBonus":false,"scoreboard":{"questions":[[[],[]],[[],[]],[[],[]],[[],[]],[[],[]],[[],[]],[[],[]],[[],[]],[[],[]],[[],[]],[[],[]],[[],[]],[[],[]],[[],[]],[[],[]],[[],[]],[[],[]],[[],[]],[[],[]],[[],[]],[[],[]],[[],[]],[[],[]],[[],[]]],"whoBuzzed":[[null,null],[null,null],[null,null],[null,null],[null,null],[null,null],[null,null],[null,null],[null,null],[null,null],[null,null],[null,null],[null,null],[null,null],[null,null],[null,null],[null,null],[null,null],[null,null],[null,null],[null,null],[null,null],[null,null],[null,null]],"offsets":[0,0],"currentSize":24},"questionTimer":null,"timeUp":false,"timerRunning":false,"roundNum":1},"26":{"teams":[{"id":110,"name":"Northview","joinCode":"s9a5de8zdvlfgfkik7vmh0md1xkke53k","roomId":26,"createdAt":"2022-03-20T03:43:51.171Z","updatedAt":"2022-03-26T15:42:40.596Z","members":[{"id":505,"fullName":"Hanvit Lee","email":"hanvitlee@gmail.com","googleId":"107797547241232285720","teamPosition":461401,"roomId":26,"isPlayer":true,"isMod":false,"isAdmin":false,"createdAt":"2022-03-26T02:44:44.748Z","updatedAt":"2022-03-26T15:42:40.596Z","teamId":110,"joined":true,"focused":true,"buzzing":false},{"id":271,"fullName":"Eric Liu","email":"ericzliu73@gmail.com","googleId":"113272260506567946998","teamPosition":574207,"roomId":26,"isPlayer":true,"isMod":false,"isAdmin":false,"createdAt":"2022-03-20T13:53:49.277Z","updatedAt":"2022-03-26T15:42:40.596Z","teamId":110,"joined":true,"focused":true,"buzzing":false}],"Room":{"id":26,"roomName":"F-1","meetingLink":"https://prometheus.science/franklin943","createdAt":"2022-03-25T18:15:16.975Z","updatedAt":"2022-03-25T18:15:16.975Z"},"score":0,"lockedOut":false},{"id":23,"name":"Wayzata","joinCode":"assa72knvvf1f5kxt2m5ar05zh5mvhp5","roomId":26,"createdAt":"2022-03-16T00:57:33.000Z","updatedAt":"2022-03-26T15:42:40.601Z","members":[{"id":573,"fullName":"Pramit Jagtap","email":"jagtapra000@isd284.com","googleId":"109320365772556239770","teamPosition":668296,"roomId":26,"isPlayer":true,"isMod":false,"isAdmin":false,"createdAt":"2022-03-26T15:16:12.852Z","updatedAt":"2022-03-26T15:42:40.601Z","teamId":23,"joined":false,"focused":false},{"id":509,"fullName":"Emily L","email":"liuemi001@isd284.com","googleId":"107781870679798607825","teamPosition":656057,"roomId":26,"isPlayer":true,"isMod":false,"isAdmin":false,"createdAt":"2022-03-26T02:50:10.562Z","updatedAt":"2022-03-26T15:42:40.601Z","teamId":23,"joined":true,"focused":true,"buzzing":false},{"id":485,"fullName":"MATTHEW CHEN","email":"chenmat001@isd284.com","googleId":"116721216238586890410","teamPosition":586036,"roomId":26,"isPlayer":true,"isMod":false,"isAdmin":false,"createdAt":"2022-03-26T01:16:52.692Z","updatedAt":"2022-03-26T15:42:40.601Z","teamId":23,"joined":true,"focused":true,"buzzing":false},{"id":480,"fullName":"ANEESH SWAMINATHAN","email":"swamiane000@isd284.com","googleId":"109307678008382280277","teamPosition":34425,"roomId":26,"isPlayer":true,"isMod":false,"isAdmin":false,"createdAt":"2022-03-26T00:37:56.027Z","updatedAt":"2022-03-26T15:42:40.601Z","teamId":23,"joined":true,"focused":true,"buzzing":false},{"id":157,"fullName":"Kevin Yang","email":"yangkev000@isd284.com","googleId":"112611779326561835517","teamPosition":29707,"roomId":26,"isPlayer":true,"isMod":false,"isAdmin":false,"createdAt":"2022-03-16T18:05:57.773Z","updatedAt":"2022-03-26T15:42:40.601Z","teamId":23,"joined":true,"focused":true,"buzzing":false}],"Room":{"id":26,"roomName":"F-1","meetingLink":"https://prometheus.science/franklin943","createdAt":"2022-03-25T18:15:16.975Z","updatedAt":"2022-03-25T18:15:16.975Z"},"score":0,"lockedOut":false}],"opened":true,"questionNum":0,"finished":false,"buzzActive":null,"onBonus":false,"scoreboard":{"questions":[[[],[]],[[],[]],[[],[]],[[],[]],[[],[]],[[],[]],[[],[]],[[],[]],[[],[]],[[],[]],[[],[]],[[],[]],[[],[]],[[],[]],[[],[]],[[],[]],[[],[]],[[],[]],[[],[]],[[],[]],[[],[]],[[],[]],[[],[]],[[],[]]],"whoBuzzed":[[null,null],[null,null],[null,null],[null,null],[null,null],[null,null],[null,null],[null,null],[null,null],[null,null],[null,null],[null,null],[null,null],[null,null],[null,null],[null,null],[null,null],[null,null],[null,null],[null,null],[null,null],[null,null],[null,null],[null,null]],"offsets":[0,0],"currentSize":24},"questionTimer":null,"timeUp":false,"timerRunning":false,"roundNum":1,"answeringTeam":null},"27":{"teams":[{"id":85,"name":"CBA Albany","joinCode":"92s7gtowvhkv0vn4koo62nxjlbsno9gm","roomId":27,"createdAt":"2022-03-16T00:57:33.000Z","updatedAt":"2022-03-26T15:42:40.595Z","members":[{"id":235,"fullName":"Aidan Febus","email":"4febusa@cbaalbany.org","googleId":"115394045567561713791","teamPosition":622583,"roomId":27,"isPlayer":true,"isMod":false,"isAdmin":false,"createdAt":"2022-03-19T20:15:20.158Z","updatedAt":"2022-03-26T15:42:40.595Z","teamId":85,"joined":true,"focused":true,"buzzing":false},{"id":234,"fullName":"Hubert Huho","email":"4huhoh@cbaalbany.org","googleId":"110188831973717353675","teamPosition":462845,"roomId":27,"isPlayer":true,"isMod":false,"isAdmin":false,"createdAt":"2022-03-19T20:13:41.947Z","updatedAt":"2022-03-26T15:42:40.595Z","teamId":85,"joined":true,"focused":true,"buzzing":false},{"id":400,"fullName":"Asif Alam","email":"4alama@cbaalbany.org","googleId":"109146729435699480638","teamPosition":388150,"roomId":27,"isPlayer":true,"isMod":false,"isAdmin":false,"createdAt":"2022-03-24T22:27:52.006Z","updatedAt":"2022-03-26T15:42:40.595Z","teamId":85,"joined":true,"focused":true,"buzzing":false},{"id":233,"fullName":"Kagame Ndashimye Rama-Munroe","email":"4ramak@cbaalbany.org","googleId":"117225162578999393860","teamPosition":620652,"roomId":27,"isPlayer":true,"isMod":false,"isAdmin":false,"createdAt":"2022-03-19T20:11:49.942Z","updatedAt":"2022-03-26T15:42:40.595Z","teamId":85,"joined":true,"focused":true,"buzzing":false}],"Room":{"id":27,"roomName":"F-2","meetingLink":"https://prometheus.science/franklin943","createdAt":"2022-03-25T18:15:16.975Z","updatedAt":"2022-03-25T18:15:16.975Z"},"score":0,"lockedOut":false},{"id":38,"name":"Whitney Young A","joinCode":"k556o2dretg3oxpki6e1tp9am67blrc6","roomId":27,"createdAt":"2022-03-16T00:57:33.000Z","updatedAt":"2022-03-26T15:42:40.598Z","members":[{"id":98,"fullName":"Arnav Goel","email":"arnavmgoel@gmail.com","googleId":"108873735674065227853","teamPosition":145700,"roomId":27,"isPlayer":true,"isMod":false,"isAdmin":false,"createdAt":"2022-03-16T04:53:16.589Z","updatedAt":"2022-03-26T15:42:40.598Z","teamId":38,"joined":true,"focused":true},{"id":134,"fullName":"Christina Li","email":"cli4@cps.edu","googleId":"102876109514194645190","teamPosition":466741,"roomId":27,"isPlayer":true,"isMod":false,"isAdmin":false,"createdAt":"2022-03-16T11:26:09.094Z","updatedAt":"2022-03-26T15:42:40.598Z","teamId":38,"joined":true,"focused":true},{"id":110,"fullName":"Evan Assmus","email":"evanwassmus@gmail.com","googleId":"116832305403775907741","teamPosition":341821,"roomId":27,"isPlayer":true,"isMod":false,"isAdmin":false,"createdAt":"2022-03-16T05:09:51.194Z","updatedAt":"2022-03-26T15:42:40.598Z","teamId":38,"joined":true,"focused":true},{"id":105,"fullName":"Nicholas Hong","email":"nchong@cps.edu","googleId":"111024009920494251006","teamPosition":762438,"roomId":27,"isPlayer":true,"isMod":false,"isAdmin":false,"createdAt":"2022-03-16T04:59:10.598Z","updatedAt":"2022-03-26T15:42:40.598Z","teamId":38,"joined":true,"focused":true},{"id":196,"fullName":"Jack Edwards","email":"jedwards29@cps.edu","googleId":"108951721538135560483","teamPosition":991495,"roomId":27,"isPlayer":true,"isMod":false,"isAdmin":false,"createdAt":"2022-03-17T14:22:04.348Z","updatedAt":"2022-03-26T15:42:40.598Z","teamId":38,"joined":true,"focused":true,"buzzing":false}],"Room":{"id":27,"roomName":"F-2","meetingLink":"https://prometheus.science/franklin943","createdAt":"2022-03-25T18:15:16.975Z","updatedAt":"2022-03-25T18:15:16.975Z"},"score":14,"lockedOut":false}],"opened":true,"questionNum":1,"finished":false,"buzzActive":null,"onBonus":false,"scoreboard":{"questions":[[[],[1,1]],[[],[]],[[],[]],[[],[]],[[],[]],[[],[]],[[],[]],[[],[]],[[],[]],[[],[]],[[],[]],[[],[]],[[],[]],[[],[]],[[],[]],[[],[]],[[],[]],[[],[]],[[],[]],[[],[]],[[],[]],[[],[]],[[],[]],[[],[]]],"whoBuzzed":[[null,"108951721538135560483"],[null,null],[null,null],[null,null],[null,null],[null,null],[null,null],[null,null],[null,null],[null,null],[null,null],[null,null],[null,null],[null,null],[null,null],[null,null],[null,null],[null,null],[null,null],[null,null],[null,null],[null,null],[null,null],[null,null]],"offsets":[0,0],"currentSize":24},"questionTimer":{"_idleTimeout":-1,"_idlePrev":null,"_idleNext":null,"_idleStart":2813928,"_onTimeout":null,"_repeat":null,"_destroyed":true},"timeUp":false,"timerRunning":false,"roundNum":1,"answeringTeam":null},"29":{"teams":[{"id":120,"name":"Marquette B","joinCode":"1c5rpf62rdqin85wrrmnuqhackr3vvfg","roomId":29,"createdAt":"2022-03-22T23:19:33.781Z","updatedAt":"2022-03-26T15:42:40.599Z","members":[{"id":441,"fullName":"Pranav Vaikuntam","email":"pvaikuntam092@rsdmo.org","googleId":"114130968595912197580","teamPosition":223238,"roomId":29,"isPlayer":true,"isMod":false,"isAdmin":false,"createdAt":"2022-03-25T16:23:36.689Z","updatedAt":"2022-03-26T15:42:40.599Z","teamId":120,"joined":true,"focused":true,"buzzing":false},{"id":581,"fullName":"Aarush Rajoli","email":"aarushrajoli215@gmail.com","googleId":"117175850653790816350","teamPosition":823384,"roomId":29,"isPlayer":true,"isMod":false,"isAdmin":false,"createdAt":"2022-03-26T15:25:11.079Z","updatedAt":"2022-03-26T15:42:40.599Z","teamId":120,"joined":true,"focused":true,"buzzing":false},{"id":311,"fullName":"Jatin Sridhar","email":"jsridhar015@rsdmo.org","googleId":"100640637075367168878","teamPosition":588198,"roomId":29,"isPlayer":true,"isMod":false,"isAdmin":false,"createdAt":"2022-03-23T01:06:36.548Z","updatedAt":"2022-03-26T15:42:40.599Z","teamId":120,"joined":true,"focused":true,"buzzing":false},{"id":493,"fullName":"EDWARD YUE - STUDENT","email":"eyue042@rsdmo.org","googleId":"109072155293515637288","teamPosition":717341,"roomId":29,"isPlayer":true,"isMod":false,"isAdmin":false,"createdAt":"2022-03-26T02:01:32.963Z","updatedAt":"2022-03-26T15:42:40.599Z","teamId":120,"joined":true,"focused":true,"buzzing":false},{"id":342,"fullName":"Atharva Shinde","email":"ashinde018@rsdmo.org","googleId":"107789422829421445520","teamPosition":298181,"roomId":29,"isPlayer":true,"isMod":false,"isAdmin":false,"createdAt":"2022-03-23T18:15:51.377Z","updatedAt":"2022-03-26T15:42:40.599Z","teamId":120,"joined":true,"focused":true,"buzzing":false}],"Room":{"id":29,"roomName":"G-1","meetingLink":"https://prometheus.science/goodall652","createdAt":"2022-03-25T18:15:16.975Z","updatedAt":"2022-03-25T18:15:16.975Z"},"score":0,"lockedOut":false},{"id":42,"name":"Ward Melville A","joinCode":"jcna49i8kqu6elldo1kvlxp0xwqm404c","roomId":29,"createdAt":"2022-03-16T00:57:33.000Z","updatedAt":"2022-03-26T15:42:40.602Z","members":[{"id":174,"fullName":"Matthew Chen","email":"mattawesome28@gmail.com","googleId":"100851346398886396234","teamPosition":428870,"roomId":29,"isPlayer":true,"isMod":false,"isAdmin":false,"createdAt":"2022-03-16T23:32:47.678Z","updatedAt":"2022-03-26T15:42:40.602Z","teamId":42,"joined":true,"focused":true},{"id":175,"fullName":"Neal Carpino","email":"nealcarpino@gmail.com","googleId":"107422232778686939209","teamPosition":785781,"roomId":29,"isPlayer":true,"isMod":false,"isAdmin":false,"createdAt":"2022-03-16T23:33:07.031Z","updatedAt":"2022-03-26T15:42:40.602Z","teamId":42,"joined":true,"focused":true},{"id":483,"fullName":"Michael Melikyan","email":"michaelmelikyan@gmail.com","googleId":"110230235891551008286","teamPosition":838335,"roomId":29,"isPlayer":true,"isMod":false,"isAdmin":false,"createdAt":"2022-03-26T01:04:38.009Z","updatedAt":"2022-03-26T15:42:40.602Z","teamId":42,"joined":true,"focused":true},{"id":133,"fullName":"Ivan Ge","email":"ge.ivan2004@gmail.com","googleId":"112802261478041110799","teamPosition":101260,"roomId":29,"isPlayer":true,"isMod":false,"isAdmin":false,"createdAt":"2022-03-16T11:22:43.365Z","updatedAt":"2022-03-26T15:42:40.602Z","teamId":42}],"Room":{"id":29,"roomName":"G-1","meetingLink":"https://prometheus.science/goodall652","createdAt":"2022-03-25T18:15:16.975Z","updatedAt":"2022-03-25T18:15:16.975Z"},"score":0}],"opened":false,"questionNum":0,"finished":false,"buzzActive":null,"onBonus":false,"scoreboard":{"questions":[[[],[]],[[],[]],[[],[]],[[],[]],[[],[]],[[],[]],[[],[]],[[],[]],[[],[]],[[],[]],[[],[]],[[],[]],[[],[]],[[],[]],[[],[]],[[],[]],[[],[]],[[],[]],[[],[]],[[],[]],[[],[]],[[],[]],[[],[]],[[],[]]],"whoBuzzed":[[null,null],[null,null],[null,null],[null,null],[null,null],[null,null],[null,null],[null,null],[null,null],[null,null],[null,null],[null,null],[null,null],[null,null],[null,null],[null,null],[null,null],[null,null],[null,null],[null,null],[null,null],[null,null],[null,null],[null,null]],"offsets":[0,0],"currentSize":24},"questionTimer":null,"timeUp":false,"timerRunning":false,"roundNum":1},"31":{"teams":[{"id":22,"name":"MSJ A","joinCode":"kjizn161kmk6539xc8ryps7sn9v74vdg","roomId":31,"createdAt":"2022-03-16T00:57:33.000Z","updatedAt":"2022-03-26T15:42:40.600Z","members":[{"id":525,"fullName":"Samuel Zhou","email":"samueltzhou@gmail.com","googleId":"101259634814577741936","teamPosition":471681,"roomId":31,"isPlayer":true,"isMod":false,"isAdmin":false,"createdAt":"2022-03-26T04:39:37.236Z","updatedAt":"2022-03-26T15:42:40.600Z","teamId":22,"joined":false,"focused":false,"buzzing":false},{"id":523,"fullName":"Gokulanath Mahesh Kumar","email":"gokuljagann@gmail.com","googleId":"113689800994596883699","teamPosition":685530,"roomId":31,"isPlayer":true,"isMod":false,"isAdmin":false,"createdAt":"2022-03-26T04:21:08.823Z","updatedAt":"2022-03-26T15:42:40.600Z","teamId":22,"joined":true,"focused":true,"buzzing":false},{"id":97,"fullName":"Inimai Subramanian","email":"purpleopard1729@gmail.com","googleId":"102649924675385864145","teamPosition":359092,"roomId":31,"isPlayer":true,"isMod":false,"isAdmin":false,"createdAt":"2022-03-16T04:53:07.935Z","updatedAt":"2022-03-26T15:42:40.600Z","teamId":22,"joined":false,"focused":false,"buzzing":false},{"id":211,"fullName":"Titus Tsai","email":"titus.tsai@gmail.com","googleId":"113208158437062052347","teamPosition":181208,"roomId":31,"isPlayer":true,"isMod":false,"isAdmin":false,"createdAt":"2022-03-18T04:45:59.905Z","updatedAt":"2022-03-26T15:42:40.600Z","teamId":22,"joined":false,"focused":false,"buzzing":false},{"id":425,"fullName":"Richard Chen","email":"richardchen2003@gmail.com","googleId":"106956047942566462812","teamPosition":333722,"roomId":31,"isPlayer":true,"isMod":false,"isAdmin":false,"createdAt":"2022-03-25T03:42:26.269Z","updatedAt":"2022-03-26T15:42:40.600Z","teamId":22,"joined":true,"focused":true,"buzzing":false}],"Room":{"id":31,"roomName":"G-3","meetingLink":"https://prometheus.science/goodall652","createdAt":"2022-03-25T18:15:16.975Z","updatedAt":"2022-03-25T18:15:16.975Z"},"score":0,"lockedOut":false},{"id":51,"name":"Stanford OHS B","joinCode":"edv4cjp2rlbw6h5pf6qv800ycgbrcs0d","roomId":31,"createdAt":"2022-03-16T00:57:33.000Z","updatedAt":"2022-03-26T15:42:40.605Z","members":[{"id":348,"fullName":"Siddhant Karmali","email":"siddhant.karmali@gmail.com","googleId":"116399243566701991123","teamPosition":780079,"roomId":31,"isPlayer":true,"isMod":false,"isAdmin":false,"createdAt":"2022-03-23T20:20:53.334Z","updatedAt":"2022-03-26T15:42:40.605Z","teamId":51},{"id":443,"fullName":"Justin Wang","email":"justinw16688@gmail.com","googleId":"105406489580000470684","teamPosition":972636,"roomId":31,"isPlayer":true,"isMod":false,"isAdmin":false,"createdAt":"2022-03-25T17:49:19.615Z","updatedAt":"2022-03-26T15:42:40.605Z","teamId":51,"joined":false,"focused":false},{"id":118,"fullName":"Vikram Arumugham","email":"vikramcube1@gmail.com","googleId":"108459053894139854379","teamPosition":154298,"roomId":31,"isPlayer":true,"isMod":false,"isAdmin":false,"createdAt":"2022-03-16T05:39:01.107Z","updatedAt":"2022-03-26T15:42:40.605Z","teamId":51,"joined":true,"focused":true},{"id":251,"fullName":"Ayden Hur","email":"aydenhur@gmail.com","googleId":"106269283682334954637","teamPosition":192346,"roomId":31,"isPlayer":true,"isMod":false,"isAdmin":false,"createdAt":"2022-03-19T23:24:23.533Z","updatedAt":"2022-03-26T15:42:40.605Z","teamId":51,"joined":true,"focused":true},{"id":221,"fullName":"Tanish Kumar","email":"tanish.ohs@gmail.com","googleId":"103394931309758260891","teamPosition":122442,"roomId":31,"isPlayer":true,"isMod":false,"isAdmin":false,"createdAt":"2022-03-19T01:27:18.985Z","updatedAt":"2022-03-26T15:42:40.605Z","teamId":51}],"Room":{"id":31,"roomName":"G-3","meetingLink":"https://prometheus.science/goodall652","createdAt":"2022-03-25T18:15:16.975Z","updatedAt":"2022-03-25T18:15:16.975Z"},"score":0}],"opened":false,"questionNum":0,"finished":false,"buzzActive":null,"onBonus":false,"scoreboard":{"questions":[[[],[]],[[],[]],[[],[]],[[],[]],[[],[]],[[],[]],[[],[]],[[],[]],[[],[]],[[],[]],[[],[]],[[],[]],[[],[]],[[],[]],[[],[]],[[],[]],[[],[]],[[],[]],[[],[]],[[],[]],[[],[]],[[],[]],[[],[]],[[],[]]],"whoBuzzed":[[null,null],[null,null],[null,null],[null,null],[null,null],[null,null],[null,null],[null,null],[null,null],[null,null],[null,null],[null,null],[null,null],[null,null],[null,null],[null,null],[null,null],[null,null],[null,null],[null,null],[null,null],[null,null],[null,null],[null,null]],"offsets":[0,0],"currentSize":24},"questionTimer":null,"timeUp":false,"timerRunning":false,"roundNum":1},"32":{"teams":[{"id":13,"name":"Pleasanton","joinCode":"crbr6ekt7kfkw7hmetwdtd69h16ysa4h","roomId":32,"createdAt":"2022-03-16T00:57:33.000Z","updatedAt":"2022-03-26T15:42:40.602Z","members":[{"id":99,"fullName":"Ritwik Aeka","email":"ra0724@pleasantonusd.net","googleId":"104061953843243020502","teamPosition":792080,"roomId":32,"isPlayer":true,"isMod":false,"isAdmin":false,"createdAt":"2022-03-16T04:53:20.321Z","updatedAt":"2022-03-26T15:42:40.602Z","teamId":13,"joined":true,"focused":true,"buzzing":false},{"id":357,"fullName":"Aanya Guthula","email":"ag1022@pleasantonusd.net","googleId":"113517534537733341555","teamPosition":758646,"roomId":32,"isPlayer":true,"isMod":false,"isAdmin":false,"createdAt":"2022-03-24T00:16:18.397Z","updatedAt":"2022-03-26T15:42:40.602Z","teamId":13,"joined":false,"focused":false,"buzzing":false},{"id":179,"fullName":"Gaurav Gupta","email":"gg4326@pleasantonusd.net","googleId":"113371678448710533296","teamPosition":926230,"roomId":32,"isPlayer":true,"isMod":false,"isAdmin":false,"createdAt":"2022-03-17T00:48:40.454Z","updatedAt":"2022-03-26T15:42:40.602Z","teamId":13,"joined":true,"focused":true,"buzzing":false},{"id":487,"fullName":"Preeti Polavarapu","email":"pp2864@pleasantonusd.net","googleId":"104424523797618760195","teamPosition":427032,"roomId":32,"isPlayer":true,"isMod":false,"isAdmin":false,"createdAt":"2022-03-26T01:32:23.158Z","updatedAt":"2022-03-26T15:42:40.602Z","teamId":13,"joined":true,"focused":true,"buzzing":false},{"id":152,"fullName":"Arthur Tang","email":"at4013@pleasantonusd.net","googleId":"115775333529496016955","teamPosition":295913,"roomId":32,"isPlayer":true,"isMod":false,"isAdmin":false,"createdAt":"2022-03-16T15:49:21.463Z","updatedAt":"2022-03-26T15:42:40.602Z","teamId":13,"joined":true,"focused":true,"buzzing":false}],"Room":{"id":32,"roomName":"H-1","meetingLink":"https://prometheus.science/hawking633","createdAt":"2022-03-25T18:15:16.975Z","updatedAt":"2022-03-25T18:15:16.975Z"},"score":0,"lockedOut":false},{"id":80,"name":"Wheaton","joinCode":"oxmmjzx30i1q8qfxyu2x1n78gveva3qn","roomId":32,"createdAt":"2022-03-16T00:57:33.000Z","updatedAt":"2022-03-26T15:42:40.605Z","members":[{"id":159,"fullName":"Alex R","email":"alexanderrobbins@gmail.com","googleId":"117008990294213320994","teamPosition":984218,"roomId":32,"isPlayer":true,"isMod":false,"isAdmin":false,"createdAt":"2022-03-16T18:41:35.690Z","updatedAt":"2022-03-26T15:42:40.605Z","teamId":80},{"id":345,"fullName":"Anne Sacks","email":"anne.c.sacks@gmail.com","googleId":"114418026751518980352","teamPosition":189667,"roomId":32,"isPlayer":true,"isMod":false,"isAdmin":false,"createdAt":"2022-03-23T18:43:38.583Z","updatedAt":"2022-03-26T15:42:40.605Z","teamId":80,"joined":true,"focused":true},{"id":389,"fullName":"Pari Lakhiani","email":"yellorubberduck65@gmail.com","googleId":"104316802459313403493","teamPosition":214859,"roomId":32,"isPlayer":true,"isMod":false,"isAdmin":false,"createdAt":"2022-03-24T17:21:33.837Z","updatedAt":"2022-03-26T15:42:40.605Z","teamId":80,"joined":true,"focused":true},{"id":445,"fullName":"James","email":"polyarchitecht@gmail.com","googleId":"106909820970733363401","teamPosition":435442,"roomId":32,"isPlayer":true,"isMod":false,"isAdmin":false,"createdAt":"2022-03-25T19:52:02.956Z","updatedAt":"2022-03-26T15:42:40.605Z","teamId":80,"joined":true,"focused":true}],"Room":{"id":32,"roomName":"H-1","meetingLink":"https://prometheus.science/hawking633","createdAt":"2022-03-25T18:15:16.975Z","updatedAt":"2022-03-25T18:15:16.975Z"},"score":0}],"opened":false,"questionNum":0,"finished":false,"buzzActive":null,"onBonus":false,"scoreboard":{"questions":[[[],[]],[[],[]],[[],[]],[[],[]],[[],[]],[[],[]],[[],[]],[[],[]],[[],[]],[[],[]],[[],[]],[[],[]],[[],[]],[[],[]],[[],[]],[[],[]],[[],[]],[[],[]],[[],[]],[[],[]],[[],[]],[[],[]],[[],[]],[[],[]]],"whoBuzzed":[[null,null],[null,null],[null,null],[null,null],[null,null],[null,null],[null,null],[null,null],[null,null],[null,null],[null,null],[null,null],[null,null],[null,null],[null,null],[null,null],[null,null],[null,null],[null,null],[null,null],[null,null],[null,null],[null,null],[null,null]],"offsets":[0,0],"currentSize":24},"questionTimer":null,"timeUp":false,"timerRunning":false,"roundNum":1},"34":{"teams":[{"id":56,"name":"Stuy A","joinCode":"1xe0i6npbz6rgqyh59fsaxkgruuxdrw7","roomId":34,"createdAt":"2022-03-16T00:57:33.000Z","updatedAt":"2022-03-26T15:42:40.603Z","members":[{"id":550,"fullName":"John La Micela","email":"jlamicela30@stuy.edu","googleId":"107231673523994737399","teamPosition":962826,"roomId":34,"isPlayer":true,"isMod":false,"isAdmin":false,"createdAt":"2022-03-26T12:09:17.554Z","updatedAt":"2022-03-26T15:42:40.603Z","teamId":56,"joined":true,"focused":true,"buzzing":false},{"id":349,"fullName":"Sky Chen","email":"schen32@stuy.edu","googleId":"106641635711057274154","teamPosition":279943,"roomId":34,"isPlayer":true,"isMod":false,"isAdmin":false,"createdAt":"2022-03-23T21:03:21.826Z","updatedAt":"2022-03-26T15:42:40.603Z","teamId":56,"joined":true,"focused":true,"buzzing":false},{"id":177,"fullName":"Keerthan Kumarappan","email":"kkumarappan30@stuy.edu","googleId":"116948952485627963781","teamPosition":975574,"roomId":34,"isPlayer":true,"isMod":false,"isAdmin":false,"createdAt":"2022-03-17T00:38:08.130Z","updatedAt":"2022-03-26T15:42:40.603Z","teamId":56,"joined":false,"focused":false,"buzzing":false},{"id":339,"fullName":"Edward Oo","email":"eoo20@stuy.edu","googleId":"102631384831276647176","teamPosition":727610,"roomId":34,"isPlayer":true,"isMod":false,"isAdmin":false,"createdAt":"2022-03-23T18:00:13.487Z","updatedAt":"2022-03-26T15:42:40.603Z","teamId":56,"joined":true,"focused":true,"buzzing":false},{"id":107,"fullName":"Hua Huang","email":"hhuang31@stuy.edu","googleId":"112189577318502489601","teamPosition":40999,"roomId":34,"isPlayer":true,"isMod":false,"isAdmin":false,"createdAt":"2022-03-16T05:03:58.402Z","updatedAt":"2022-03-26T15:42:40.603Z","teamId":56,"joined":false,"focused":false,"buzzing":false}],"Room":{"id":34,"roomName":"H-3","meetingLink":"https://prometheus.science/hawking633","createdAt":"2022-03-25T18:15:16.975Z","updatedAt":"2022-03-25T18:15:16.975Z"},"score":0,"lockedOut":false},{"id":71,"name":"Ward Melville B","joinCode":"xir59vsfiix4jbuqqzzjbftptdtj1re7","roomId":34,"createdAt":"2022-03-16T00:57:33.000Z","updatedAt":"2022-03-26T15:42:40.604Z","members":[{"id":431,"fullName":"Rithik Sogal","email":"rithiksogal101@gmail.com","googleId":"112163792304386109400","teamPosition":520338,"roomId":34,"isPlayer":true,"isMod":false,"isAdmin":false,"createdAt":"2022-03-25T11:28:06.273Z","updatedAt":"2022-03-26T15:42:40.604Z","teamId":71,"joined":true,"focused":true},{"id":189,"fullName":"Prisha S","email":"prisha300@gmail.com","googleId":"110550324509466879045","teamPosition":722654,"roomId":34,"isPlayer":true,"isMod":false,"isAdmin":false,"createdAt":"2022-03-17T03:04:02.039Z","updatedAt":"2022-03-26T15:42:40.604Z","teamId":71,"joined":true,"focused":true},{"id":432,"fullName":"Ben Zhang","email":"benz5460@gmail.com","googleId":"104795187559017403432","teamPosition":124434,"roomId":34,"isPlayer":true,"isMod":false,"isAdmin":false,"createdAt":"2022-03-25T11:29:31.416Z","updatedAt":"2022-03-26T15:42:40.604Z","teamId":71,"joined":true,"focused":true},{"id":146,"fullName":"Ben Proothi","email":"bproothi@gmail.com","googleId":"107014239195384702346","teamPosition":20263,"roomId":34,"isPlayer":true,"isMod":false,"isAdmin":false,"createdAt":"2022-03-16T13:30:03.893Z","updatedAt":"2022-03-26T15:42:40.604Z","teamId":71,"joined":true,"focused":true},{"id":449,"fullName":"Kevin Shi","email":"ks.a1a1a1q1@gmail.com","googleId":"102292539546090944708","teamPosition":994469,"roomId":34,"isPlayer":true,"isMod":false,"isAdmin":false,"createdAt":"2022-03-25T20:47:36.554Z","updatedAt":"2022-03-26T15:42:40.604Z","teamId":71,"joined":true,"focused":true}],"Room":{"id":34,"roomName":"H-3","meetingLink":"https://prometheus.science/hawking633","createdAt":"2022-03-25T18:15:16.975Z","updatedAt":"2022-03-25T18:15:16.975Z"},"score":0}],"opened":false,"questionNum":0,"finished":false,"buzzActive":null,"onBonus":false,"scoreboard":{"questions":[[[],[]],[[],[]],[[],[]],[[],[]],[[],[]],[[],[]],[[],[]],[[],[]],[[],[]],[[],[]],[[],[]],[[],[]],[[],[]],[[],[]],[[],[]],[[],[]],[[],[]],[[],[]],[[],[]],[[],[]],[[],[]],[[],[]],[[],[]],[[],[]]],"whoBuzzed":[[null,null],[null,null],[null,null],[null,null],[null,null],[null,null],[null,null],[null,null],[null,null],[null,null],[null,null],[null,null],[null,null],[null,null],[null,null],[null,null],[null,null],[null,null],[null,null],[null,null],[null,null],[null,null],[null,null],[null,null]],"offsets":[0,0],"currentSize":24},"questionTimer":null,"timeUp":false,"timerRunning":false,"roundNum":1},"35":{"teams":[{"id":24,"name":"Mira Loma A","joinCode":"039j8vnnl40h28g297igo0xpiya4wtt2","roomId":35,"createdAt":"2022-03-16T00:57:33.000Z","updatedAt":"2022-03-26T15:42:40.606Z","members":[{"id":111,"fullName":"Vish","email":"vishwareddy@gmail.com","googleId":"114252014978841963041","teamPosition":351315,"roomId":35,"isPlayer":true,"isMod":false,"isAdmin":false,"createdAt":"2022-03-16T05:18:21.383Z","updatedAt":"2022-03-26T15:42:40.606Z","teamId":24,"joined":true,"focused":true,"buzzing":false},{"id":113,"fullName":"Shohom Chakraborty","email":"shochak2016@gmail.com","googleId":"118096044560523889571","teamPosition":676206,"roomId":35,"isPlayer":true,"isMod":false,"isAdmin":false,"createdAt":"2022-03-16T05:19:28.023Z","updatedAt":"2022-03-26T15:42:40.606Z","teamId":24,"joined":true,"focused":true,"buzzing":false},{"id":220,"fullName":"Sarthak [Mira Loma A]","email":"sarthaka1878@gmail.com","googleId":"112365538603424634117","teamPosition":333263,"roomId":35,"isPlayer":true,"isMod":false,"isAdmin":false,"createdAt":"2022-03-18T23:39:50.647Z","updatedAt":"2022-03-26T15:42:40.606Z","teamId":24,"joined":true,"focused":true,"buzzing":false},{"id":115,"fullName":"Nipun D","email":"nipundour@gmail.com","googleId":"115851460800773085420","teamPosition":687285,"roomId":35,"isPlayer":true,"isMod":false,"isAdmin":false,"createdAt":"2022-03-16T05:27:59.012Z","updatedAt":"2022-03-26T15:42:40.606Z","teamId":24,"joined":true,"focused":true,"buzzing":false},{"id":109,"fullName":"Aditya Sivakumar","email":"adisiv2005@gmail.com","googleId":"106648210295642152952","teamPosition":41075,"roomId":35,"isPlayer":true,"isMod":false,"isAdmin":false,"createdAt":"2022-03-16T05:06:48.731Z","updatedAt":"2022-03-26T15:42:40.606Z","teamId":24,"joined":true,"focused":true,"buzzing":false}],"Room":{"id":35,"roomName":"I-1","meetingLink":"https://prometheus.science/ising442","createdAt":"2022-03-25T18:15:16.975Z","updatedAt":"2022-03-25T18:15:16.975Z"},"score":0,"lockedOut":false},{"id":68,"name":"PRISMS","joinCode":"56m2fnemigpkpgxsmemtnawdpuylk46z","roomId":35,"createdAt":"2022-03-16T00:57:33.000Z","updatedAt":"2022-03-26T15:42:40.611Z","members":[{"id":198,"fullName":"Jonathan Yang","email":"jonathan.yang@prismsus.org","googleId":"111979333115148890229","teamPosition":209430,"roomId":35,"isPlayer":true,"isMod":false,"isAdmin":false,"createdAt":"2022-03-17T15:15:58.835Z","updatedAt":"2022-03-26T15:42:40.611Z","teamId":68,"joined":true,"focused":true},{"id":138,"fullName":"Rohan Jay","email":"rohan.jay@prismsus.org","googleId":"108903671377922335270","teamPosition":572673,"roomId":35,"isPlayer":true,"isMod":false,"isAdmin":false,"createdAt":"2022-03-16T12:04:17.617Z","updatedAt":"2022-03-26T15:42:40.611Z","teamId":68,"joined":true,"focused":true},{"id":137,"fullName":"Justin Feder","email":"justin.feder@prismsus.org","googleId":"101816927676547973811","teamPosition":338906,"roomId":35,"isPlayer":true,"isMod":false,"isAdmin":false,"createdAt":"2022-03-16T11:45:27.465Z","updatedAt":"2022-03-26T15:42:40.611Z","teamId":68,"joined":true,"focused":true,"buzzing":false},{"id":514,"fullName":"Yangjie Linhu","email":"yangjie.linhu@prismsus.org","googleId":"111045016489901956081","teamPosition":943708,"roomId":35,"isPlayer":true,"isMod":false,"isAdmin":false,"createdAt":"2022-03-26T03:15:55.726Z","updatedAt":"2022-03-26T15:42:40.611Z","teamId":68,"joined":true,"focused":true},{"id":149,"fullName":"Cedric Xiao","email":"cedric.xiao@prismsus.org","googleId":"114535102447932380461","teamPosition":269547,"roomId":35,"isPlayer":true,"isMod":false,"isAdmin":false,"createdAt":"2022-03-16T15:03:51.125Z","updatedAt":"2022-03-26T15:42:40.611Z","teamId":68,"joined":true,"focused":true}],"Room":{"id":35,"roomName":"I-1","meetingLink":"https://prometheus.science/ising442","createdAt":"2022-03-25T18:15:16.975Z","updatedAt":"2022-03-25T18:15:16.975Z"},"score":8,"lockedOut":false}],"opened":true,"questionNum":0,"finished":false,"buzzActive":null,"onBonus":true,"scoreboard":{"questions":[[[-1],[1,0]],[[],[]],[[],[]],[[],[]],[[],[]],[[],[]],[[],[]],[[],[]],[[],[]],[[],[]],[[],[]],[[],[]],[[],[]],[[],[]],[[],[]],[[],[]],[[],[]],[[],[]],[[],[]],[[],[]],[[],[]],[[],[]],[[],[]],[[],[]]],"whoBuzzed":[["106648210295642152952","101816927676547973811"],[null,null],[null,null],[null,null],[null,null],[null,null],[null,null],[null,null],[null,null],[null,null],[null,null],[null,null],[null,null],[null,null],[null,null],[null,null],[null,null],[null,null],[null,null],[null,null],[null,null],[null,null],[null,null],[null,null]],"offsets":[0,0],"currentSize":24},"questionTimer":{"_idleTimeout":-1,"_idlePrev":null,"_idleNext":null,"_idleStart":2795407,"_onTimeout":null,"_repeat":null,"_destroyed":true},"timeUp":false,"timerRunning":false,"roundNum":1,"answeringTeam":1},"37":{"teams":[{"id":117,"name":"Mt. Lebanon","joinCode":"tahyq56qam8xne1ck1h3cblbprcveftl","roomId":37,"createdAt":"2022-03-22T23:18:24.578Z","updatedAt":"2022-03-26T15:42:40.607Z","members":[{"id":310,"fullName":"Vishnu Venugopal","email":"vvenugopal94@mtlstudents.net","googleId":"110419827669429880206","teamPosition":237162,"roomId":37,"isPlayer":true,"isMod":false,"isAdmin":false,"createdAt":"2022-03-23T00:47:58.030Z","updatedAt":"2022-03-26T15:42:40.607Z","teamId":117,"joined":true,"focused":true,"buzzing":false},{"id":309,"fullName":"Akash S","email":"dragonslayer76cat@gmail.com","googleId":"105755181290180463023","teamPosition":750388,"roomId":37,"isPlayer":true,"isMod":false,"isAdmin":false,"createdAt":"2022-03-23T00:36:34.232Z","updatedAt":"2022-03-26T15:42:40.607Z","teamId":117,"joined":true,"focused":true,"buzzing":false},{"id":305,"fullName":"Victoria Finizio","email":"vfinizio58@mtlstudents.net","googleId":"106631623389850525633","teamPosition":598818,"roomId":37,"isPlayer":true,"isMod":false,"isAdmin":false,"createdAt":"2022-03-22T23:56:56.597Z","updatedAt":"2022-03-26T15:42:40.607Z","teamId":117,"joined":true,"focused":true,"buzzing":false},{"id":304,"fullName":"Anvi Tatkar","email":"atatkar25@mtlstudents.net","googleId":"105983578568001005137","teamPosition":164206,"roomId":37,"isPlayer":true,"isMod":false,"isAdmin":false,"createdAt":"2022-03-22T23:52:36.240Z","updatedAt":"2022-03-26T15:42:40.607Z","teamId":117,"joined":true,"focused":true,"buzzing":false},{"id":308,"fullName":"Lucian Mikush","email":"lmikush52@gmail.com","googleId":"100822476339428491599","teamPosition":119057,"roomId":37,"isPlayer":true,"isMod":false,"isAdmin":false,"createdAt":"2022-03-23T00:26:43.201Z","updatedAt":"2022-03-26T15:42:40.607Z","teamId":117,"joined":true,"focused":true,"buzzing":false}],"Room":{"id":37,"roomName":"I-3","meetingLink":"https://prometheus.science/ising442","createdAt":"2022-03-25T18:15:16.975Z","updatedAt":"2022-03-25T18:15:16.975Z"},"score":0,"lockedOut":false},{"id":18,"name":"Odle","joinCode":"kap44q8ruqs1zjdnhaqdb0t9r1ojdk08","roomId":37,"createdAt":"2022-03-16T00:57:33.000Z","updatedAt":"2022-03-26T15:42:40.608Z","members":[{"id":534,"fullName":"Aryan Agrawal","email":"aryanagrawal8808@gmail.com","googleId":"108154285406099225845","teamPosition":316311,"roomId":37,"isPlayer":true,"isMod":false,"isAdmin":false,"createdAt":"2022-03-26T05:24:13.855Z","updatedAt":"2022-03-26T15:42:40.608Z","teamId":18,"joined":true,"focused":true},{"id":360,"fullName":"Aishwarya Agrawal","email":"aishwaryaa8808@gmail.com","googleId":"105427895490022699519","teamPosition":346775,"roomId":37,"isPlayer":true,"isMod":false,"isAdmin":false,"createdAt":"2022-03-24T01:39:40.608Z","updatedAt":"2022-03-26T15:42:40.608Z","teamId":18,"joined":true,"focused":true},{"id":354,"fullName":"Piyush Acharya","email":"acharyapiyush11@gmail.com","googleId":"105410389356412110035","teamPosition":143334,"roomId":37,"isPlayer":true,"isMod":false,"isAdmin":false,"createdAt":"2022-03-23T23:05:48.312Z","updatedAt":"2022-03-26T15:42:40.608Z","teamId":18},{"id":555,"fullName":"Vishnu Mangipudi","email":"vishnumangipudi@gmail.com","googleId":"100741934745181838949","teamPosition":234095,"roomId":37,"isPlayer":true,"isMod":false,"isAdmin":false,"createdAt":"2022-03-26T13:12:46.077Z","updatedAt":"2022-03-26T15:42:40.608Z","teamId":18,"joined":true,"focused":true},{"id":378,"fullName":"Rishabh Vakil","email":"rishabh.vakil2@gmail.com","googleId":"105742581620835495719","teamPosition":597689,"roomId":37,"isPlayer":true,"isMod":false,"isAdmin":false,"createdAt":"2022-03-24T05:31:38.104Z","updatedAt":"2022-03-26T15:42:40.608Z","teamId":18,"joined":true,"focused":true,"buzzing":false}],"Room":{"id":37,"roomName":"I-3","meetingLink":"https://prometheus.science/ising442","createdAt":"2022-03-25T18:15:16.975Z","updatedAt":"2022-03-25T18:15:16.975Z"},"score":0,"lockedOut":false}],"opened":true,"questionNum":1,"finished":false,"buzzActive":null,"onBonus":false,"scoreboard":{"questions":[[[0],[0]],[[],[]],[[],[]],[[],[]],[[],[]],[[],[]],[[],[]],[[],[]],[[],[]],[[],[]],[[],[]],[[],[]],[[],[]],[[],[]],[[],[]],[[],[]],[[],[]],[[],[]],[[],[]],[[],[]],[[],[]],[[],[]],[[],[]],[[],[]]],"whoBuzzed":[["105755181290180463023","105742581620835495719"],[null,null],[null,null],[null,null],[null,null],[null,null],[null,null],[null,null],[null,null],[null,null],[null,null],[null,null],[null,null],[null,null],[null,null],[null,null],[null,null],[null,null],[null,null],[null,null],[null,null],[null,null],[null,null],[null,null]],"offsets":[0,0],"currentSize":24},"questionTimer":{"_idleTimeout":-1,"_idlePrev":null,"_idleNext":null,"_idleStart":2778703,"_onTimeout":null,"_repeat":null,"_destroyed":true},"timeUp":false,"timerRunning":false,"roundNum":1,"answeringTeam":null},"38":{"teams":[{"id":69,"name":"HHR A","joinCode":"w5uvioiery1fen75fssg1ijt05umaovi","roomId":38,"createdAt":"2022-03-16T00:57:33.000Z","updatedAt":"2022-03-26T15:42:40.609Z","members":[{"id":288,"fullName":"Dyllan Rodriguez","email":"apulo2002@gmail.com","googleId":"100165346221629863526","teamPosition":891850,"roomId":38,"isPlayer":true,"isMod":false,"isAdmin":false,"createdAt":"2022-03-21T17:30:22.033Z","updatedAt":"2022-03-26T15:42:40.609Z","teamId":69,"joined":true,"focused":true,"buzzing":false},{"id":559,"fullName":"Ellora Tannahill","email":"ellora.tannahill@haashall.org","googleId":"105911488593071195879","teamPosition":321894,"roomId":38,"isPlayer":true,"isMod":false,"isAdmin":false,"createdAt":"2022-03-26T14:11:59.653Z","updatedAt":"2022-03-26T15:42:40.609Z","teamId":69,"joined":true,"focused":true,"buzzing":false},{"id":364,"fullName":"Eli Elliott","email":"elielliott05@gmail.com","googleId":"113629425569314628749","teamPosition":913973,"roomId":38,"isPlayer":true,"isMod":false,"isAdmin":false,"createdAt":"2022-03-24T01:53:25.884Z","updatedAt":"2022-03-26T15:42:40.609Z","teamId":69,"joined":true,"focused":true,"buzzing":false},{"id":404,"fullName":"Devlin Zamarron","email":"devlinzamarron@gmail.com","googleId":"113032233423261487187","teamPosition":332033,"roomId":38,"isPlayer":true,"isMod":false,"isAdmin":false,"createdAt":"2022-03-24T23:11:43.527Z","updatedAt":"2022-03-26T15:42:40.609Z","teamId":69,"joined":false,"focused":false,"buzzing":false},{"id":170,"fullName":"Juan Campos-Velez","email":"juan.campos-velez@haashall.org","googleId":"106737941526077702903","teamPosition":657774,"roomId":38,"isPlayer":true,"isMod":false,"isAdmin":false,"createdAt":"2022-03-16T22:18:09.172Z","updatedAt":"2022-03-26T15:42:40.609Z","teamId":69,"joined":true,"focused":true,"buzzing":false}],"Room":{"id":38,"roomName":"J-1","meetingLink":"https://prometheus.science/joule241","createdAt":"2022-03-25T18:15:16.975Z","updatedAt":"2022-03-25T18:15:16.975Z"},"score":0,"lockedOut":false},{"id":58,"name":"Stuy B","joinCode":"9kmo8cf2lwfr6bcblhjukg6tbq713n45","roomId":38,"createdAt":"2022-03-16T00:57:33.000Z","updatedAt":"2022-03-26T15:42:40.612Z","members":[{"id":194,"fullName":"Hanson He","email":"hhe30@stuy.edu","googleId":"103261443641832709291","teamPosition":513760,"roomId":38,"isPlayer":true,"isMod":false,"isAdmin":false,"createdAt":"2022-03-17T09:42:11.176Z","updatedAt":"2022-03-26T15:42:40.612Z","teamId":58,"joined":true,"focused":true},{"id":100,"fullName":"Jack F [Stuy B]","email":"lfang30@stuy.edu","googleId":"107246376247269964358","teamPosition":402541,"roomId":38,"isPlayer":true,"isMod":false,"isAdmin":false,"createdAt":"2022-03-16T04:54:27.304Z","updatedAt":"2022-03-26T15:42:40.612Z","teamId":58,"joined":true,"focused":true},{"id":496,"fullName":"Andy Zhong","email":"azhong30@stuy.edu","googleId":"112470286049408738648","teamPosition":687819,"roomId":38,"isPlayer":true,"isMod":false,"isAdmin":false,"createdAt":"2022-03-26T02:05:54.284Z","updatedAt":"2022-03-26T15:42:40.612Z","teamId":58,"joined":true,"focused":true},{"id":102,"fullName":"Hanqi 'Alex' Zheng","email":"hzheng40@stuy.edu","googleId":"102814804516102914479","teamPosition":70306,"roomId":38,"isPlayer":true,"isMod":false,"isAdmin":false,"createdAt":"2022-03-16T04:54:33.198Z","updatedAt":"2022-03-26T15:42:40.612Z","teamId":58,"joined":true,"focused":true},{"id":168,"fullName":"Arshad Rafeeque","email":"arafeeque20@stuy.edu","googleId":"109391296486533300256","teamPosition":326529,"roomId":38,"isPlayer":true,"isMod":false,"isAdmin":false,"createdAt":"2022-03-16T21:44:10.997Z","updatedAt":"2022-03-26T15:42:40.612Z","teamId":58,"joined":true,"focused":true}],"Room":{"id":38,"roomName":"J-1","meetingLink":"https://prometheus.science/joule241","createdAt":"2022-03-25T18:15:16.975Z","updatedAt":"2022-03-25T18:15:16.975Z"},"score":0}],"opened":false,"questionNum":0,"finished":false,"buzzActive":null,"onBonus":false,"scoreboard":{"questions":[[[],[]],[[],[]],[[],[]],[[],[]],[[],[]],[[],[]],[[],[]],[[],[]],[[],[]],[[],[]],[[],[]],[[],[]],[[],[]],[[],[]],[[],[]],[[],[]],[[],[]],[[],[]],[[],[]],[[],[]],[[],[]],[[],[]],[[],[]],[[],[]]],"whoBuzzed":[[null,null],[null,null],[null,null],[null,null],[null,null],[null,null],[null,null],[null,null],[null,null],[null,null],[null,null],[null,null],[null,null],[null,null],[null,null],[null,null],[null,null],[null,null],[null,null],[null,null],[null,null],[null,null],[null,null],[null,null]],"offsets":[0,0],"currentSize":24},"questionTimer":null,"timeUp":false,"timerRunning":false,"roundNum":1},"39":{"teams":[{"id":98,"name":"Dougherty A","joinCode":"z1njpv1yic2hdmar3tp5rztmndzkd7zy","roomId":39,"createdAt":"2022-03-19T02:27:45.051Z","updatedAt":"2022-03-26T15:42:40.608Z","members":[{"id":535,"fullName":"Allan Zhang","email":"azhang314159@gmail.com","googleId":"106786946750164791783","teamPosition":341130,"roomId":39,"isPlayer":true,"isMod":false,"isAdmin":false,"createdAt":"2022-03-26T05:24:25.651Z","updatedAt":"2022-03-26T15:42:40.608Z","teamId":98,"joined":true,"focused":true,"buzzing":false},{"id":467,"fullName":"Jashan Mahajan","email":"jashanmahajan@gmail.com","googleId":"101194706070106149860","teamPosition":516412,"roomId":39,"isPlayer":true,"isMod":false,"isAdmin":false,"createdAt":"2022-03-25T23:33:00.073Z","updatedAt":"2022-03-26T15:42:40.608Z","teamId":98,"joined":true,"focused":true,"buzzing":false},{"id":322,"fullName":"Ayan Bhatia (DH)","email":"193071@students.srvusd.net","googleId":"109509141815628052416","teamPosition":505092,"roomId":39,"isPlayer":true,"isMod":false,"isAdmin":false,"createdAt":"2022-03-23T07:34:43.266Z","updatedAt":"2022-03-26T15:42:40.608Z","teamId":98,"joined":true,"focused":true,"buzzing":false},{"id":327,"fullName":"Prerana Gowda","email":"prerana.mg@gmail.com","googleId":"101188651220237019874","teamPosition":879245,"roomId":39,"isPlayer":true,"isMod":false,"isAdmin":false,"createdAt":"2022-03-23T16:15:38.731Z","updatedAt":"2022-03-26T15:42:40.608Z","teamId":98,"joined":true,"focused":true,"buzzing":false},{"id":321,"fullName":"Prayrak Bajaj","email":"prayrak.awesome@gmail.com","googleId":"115709530081960810960","teamPosition":318598,"roomId":39,"isPlayer":true,"isMod":false,"isAdmin":false,"createdAt":"2022-03-23T07:29:02.396Z","updatedAt":"2022-03-26T15:42:40.608Z","teamId":98,"joined":true,"focused":true,"buzzing":false}],"Room":{"id":39,"roomName":"J-2","meetingLink":"https://prometheus.science/joule241","createdAt":"2022-03-25T18:15:16.975Z","updatedAt":"2022-03-25T18:15:16.975Z"},"score":0,"lockedOut":false},{"id":115,"name":"Warde","joinCode":"mnrbep00j4xcyw8r5rhnvo8kk8jt2bsy","roomId":39,"createdAt":"2022-03-22T23:17:43.362Z","updatedAt":"2022-03-26T15:42:40.613Z","members":[{"id":506,"fullName":"Julia Minogue","email":"jminogue@fairfieldschools.net","googleId":"116280596430163786344","teamPosition":92645,"roomId":39,"isPlayer":true,"isMod":false,"isAdmin":false,"createdAt":"2022-03-26T02:45:20.071Z","updatedAt":"2022-03-26T15:42:40.613Z","teamId":115,"joined":true,"focused":true},{"id":484,"fullName":"Sneha Sunder","email":"ssunder@fairfieldschools.net","googleId":"111705421239686786582","teamPosition":486249,"roomId":39,"isPlayer":true,"isMod":false,"isAdmin":false,"createdAt":"2022-03-26T01:11:18.678Z","updatedAt":"2022-03-26T15:42:40.613Z","teamId":115,"joined":true,"focused":true},{"id":346,"fullName":"Evan Papageorge","email":"epapageorge@fairfieldschools.net","googleId":"115654710839909137855","teamPosition":390152,"roomId":39,"isPlayer":true,"isMod":false,"isAdmin":false,"createdAt":"2022-03-23T19:34:00.964Z","updatedAt":"2022-03-26T15:42:40.613Z","teamId":115,"joined":true,"focused":true},{"id":379,"fullName":"Evan Beinstein","email":"ebeinstein@fairfieldschools.net","googleId":"113107527475228220571","teamPosition":122902,"roomId":39,"isPlayer":true,"isMod":false,"isAdmin":false,"createdAt":"2022-03-24T11:43:08.406Z","updatedAt":"2022-03-26T15:42:40.613Z","teamId":115},{"id":490,"fullName":"Jesse Deck","email":"jdeck2@fairfieldschools.net","googleId":"111590154915915180006","teamPosition":788963,"roomId":39,"isPlayer":true,"isMod":false,"isAdmin":false,"createdAt":"2022-03-26T01:49:30.679Z","updatedAt":"2022-03-26T15:42:40.613Z","teamId":115,"joined":true,"focused":true}],"Room":{"id":39,"roomName":"J-2","meetingLink":"https://prometheus.science/joule241","createdAt":"2022-03-25T18:15:16.975Z","updatedAt":"2022-03-25T18:15:16.975Z"},"score":0}],"opened":false,"questionNum":0,"finished":false,"buzzActive":null,"onBonus":false,"scoreboard":{"questions":[[[],[]],[[],[]],[[],[]],[[],[]],[[],[]],[[],[]],[[],[]],[[],[]],[[],[]],[[],[]],[[],[]],[[],[]],[[],[]],[[],[]],[[],[]],[[],[]],[[],[]],[[],[]],[[],[]],[[],[]],[[],[]],[[],[]],[[],[]],[[],[]]],"whoBuzzed":[[null,null],[null,null],[null,null],[null,null],[null,null],[null,null],[null,null],[null,null],[null,null],[null,null],[null,null],[null,null],[null,null],[null,null],[null,null],[null,null],[null,null],[null,null],[null,null],[null,null],[null,null],[null,null],[null,null],[null,null]],"offsets":[0,0],"currentSize":24},"questionTimer":null,"timeUp":false,"timerRunning":false,"roundNum":1},"40":{"teams":[{"id":27,"name":"Jonas Clarke","joinCode":"d1x15o9pw65pxox0pgttfqozdw68tb3u","roomId":40,"createdAt":"2022-03-16T00:57:33.000Z","updatedAt":"2022-03-26T15:42:40.610Z","members":[{"id":166,"fullName":"Jerry Xu","email":"jerry.max.xu@gmail.com","googleId":"104980240808294744707","teamPosition":995404,"roomId":40,"isPlayer":true,"isMod":false,"isAdmin":false,"createdAt":"2022-03-16T20:28:39.463Z","updatedAt":"2022-03-26T15:42:40.610Z","teamId":27,"joined":true,"focused":true,"buzzing":false},{"id":180,"fullName":"William Jung","email":"26jung7@lexingtonma.org","googleId":"110342207712085723345","teamPosition":566808,"roomId":40,"isPlayer":true,"isMod":false,"isAdmin":false,"createdAt":"2022-03-17T01:03:53.256Z","updatedAt":"2022-03-26T15:42:40.610Z","teamId":27,"joined":true,"focused":true,"buzzing":false},{"id":181,"fullName":"Evin Liang","email":"ez1liang@gmail.com","googleId":"104714961629414741842","teamPosition":214731,"roomId":40,"isPlayer":true,"isMod":false,"isAdmin":false,"createdAt":"2022-03-17T01:06:25.925Z","updatedAt":"2022-03-26T15:42:40.610Z","teamId":27,"joined":true,"focused":true,"buzzing":false},{"id":184,"fullName":"Benjamin Yin","email":"benyin0828@gmail.com","googleId":"116866135735206458305","teamPosition":179537,"roomId":40,"isPlayer":true,"isMod":false,"isAdmin":false,"createdAt":"2022-03-17T01:14:58.487Z","updatedAt":"2022-03-26T15:42:40.610Z","teamId":27,"joined":true,"focused":true,"buzzing":false},{"id":553,"fullName":"William Hua","email":"hw1696@gmail.com","googleId":"115416410795975348371","teamPosition":788912,"roomId":40,"isPlayer":true,"isMod":false,"isAdmin":false,"createdAt":"2022-03-26T12:36:00.539Z","updatedAt":"2022-03-26T15:42:40.610Z","teamId":27,"joined":true,"focused":true,"buzzing":false}],"Room":{"id":40,"roomName":"J-3","meetingLink":"https://prometheus.science/joule241","createdAt":"2022-03-25T18:15:16.975Z","updatedAt":"2022-03-25T18:15:16.975Z"},"score":0,"lockedOut":false},{"id":73,"name":"MCTM Intl","joinCode":"qz8jzpjmmemea1zeipzj8rl4jndz50zj","roomId":40,"createdAt":"2022-03-16T00:57:33.000Z","updatedAt":"2022-03-26T15:42:40.611Z","members":[{"id":546,"fullName":"vilvanesh Sai","email":"vilvanesh7238@gmail.com","googleId":"100505064415962518338","teamPosition":686919,"roomId":40,"isPlayer":true,"isMod":false,"isAdmin":false,"createdAt":"2022-03-26T11:01:04.511Z","updatedAt":"2022-03-26T15:42:40.611Z","teamId":73,"joined":true,"focused":true},{"id":197,"fullName":"Yash","email":"yashpincha0706@gmail.com","googleId":"116452737481910037358","teamPosition":936956,"roomId":40,"isPlayer":true,"isMod":false,"isAdmin":false,"createdAt":"2022-03-17T14:49:17.975Z","updatedAt":"2022-03-26T15:42:40.611Z","teamId":73,"joined":true,"focused":true},{"id":383,"fullName":"Ansh Pincha","email":"anshpincha18@gmail.com","googleId":"106457187471531845221","teamPosition":252608,"roomId":40,"isPlayer":true,"isMod":false,"isAdmin":false,"createdAt":"2022-03-24T16:16:53.751Z","updatedAt":"2022-03-26T15:42:40.611Z","teamId":73,"joined":true,"focused":true},{"id":544,"fullName":"Dheeraj","email":"mochamonster08@gmail.com","googleId":"111954230983749728235","teamPosition":344496,"roomId":40,"isPlayer":true,"isMod":false,"isAdmin":false,"createdAt":"2022-03-26T08:25:28.613Z","updatedAt":"2022-03-26T15:42:40.611Z","teamId":73,"joined":true,"focused":true},{"id":380,"fullName":"Dhruv Gadgil","email":"dhruvgadgil2005@gmail.com","googleId":"104984885470374784030","teamPosition":230302,"roomId":40,"isPlayer":true,"isMod":false,"isAdmin":false,"createdAt":"2022-03-24T12:41:59.369Z","updatedAt":"2022-03-26T15:42:40.611Z","teamId":73,"joined":true,"focused":true}],"Room":{"id":40,"roomName":"J-3","meetingLink":"https://prometheus.science/joule241","createdAt":"2022-03-25T18:15:16.975Z","updatedAt":"2022-03-25T18:15:16.975Z"},"score":0}],"opened":false,"questionNum":0,"finished":false,"buzzActive":null,"onBonus":false,"scoreboard":{"questions":[[[],[]],[[],[]],[[],[]],[[],[]],[[],[]],[[],[]],[[],[]],[[],[]],[[],[]],[[],[]],[[],[]],[[],[]],[[],[]],[[],[]],[[],[]],[[],[]],[[],[]],[[],[]],[[],[]],[[],[]],[[],[]],[[],[]],[[],[]],[[],[]]],"whoBuzzed":[[null,null],[null,null],[null,null],[null,null],[null,null],[null,null],[null,null],[null,null],[null,null],[null,null],[null,null],[null,null],[null,null],[null,null],[null,null],[null,null],[null,null],[null,null],[null,null],[null,null],[null,null],[null,null],[null,null],[null,null]],"offsets":[0,0],"currentSize":24},"questionTimer":null,"timeUp":false,"timerRunning":false,"roundNum":1},"41":{"teams":[{"id":57,"name":"MSJ B","joinCode":"d4s04rgga822t9muww4fq6tmv99f8b55","roomId":41,"createdAt":"2022-03-16T00:57:33.000Z","updatedAt":"2022-03-26T15:42:40.615Z","members":[{"id":537,"fullName":"Jerry Yuan","email":"jerryyuan696@gmail.com","googleId":"105472344416055255315","teamPosition":46597,"roomId":41,"isPlayer":true,"isMod":false,"isAdmin":false,"createdAt":"2022-03-26T05:54:06.176Z","updatedAt":"2022-03-26T15:42:40.615Z","teamId":57,"joined":false,"focused":false,"buzzing":true},{"id":377,"fullName":"Daniel Liu","email":"ld8626688@gmail.com","googleId":"111717342985718095015","teamPosition":646663,"roomId":41,"isPlayer":true,"isMod":false,"isAdmin":false,"createdAt":"2022-03-24T04:53:24.986Z","updatedAt":"2022-03-26T15:42:40.615Z","teamId":57,"joined":true,"focused":true,"buzzing":false},{"id":479,"fullName":"Chahak Gupta","email":"chahakdec@gmail.com","googleId":"104244476291912530340","teamPosition":976227,"roomId":41,"isPlayer":true,"isMod":false,"isAdmin":false,"createdAt":"2022-03-26T00:37:45.745Z","updatedAt":"2022-03-26T15:42:40.615Z","teamId":57,"joined":true,"focused":true,"buzzing":false},{"id":512,"fullName":"Annie Xu","email":"anniexu0301@gmail.com","googleId":"107941462146309474360","teamPosition":440304,"roomId":41,"isPlayer":true,"isMod":false,"isAdmin":false,"createdAt":"2022-03-26T03:00:08.754Z","updatedAt":"2022-03-26T15:42:40.615Z","teamId":57,"joined":true,"focused":true,"buzzing":false},{"id":128,"fullName":"Sahas Goli","email":"sahas266@gmail.com","googleId":"113718832731163653200","teamPosition":275986,"roomId":41,"isPlayer":true,"isMod":false,"isAdmin":false,"createdAt":"2022-03-16T07:00:16.666Z","updatedAt":"2022-03-26T15:42:40.615Z","teamId":57,"joined":false,"focused":false,"buzzing":false}],"Room":{"id":41,"roomName":"K-1","meetingLink":"https://prometheus.science/kepler872","createdAt":"2022-03-25T18:15:16.975Z","updatedAt":"2022-03-25T18:15:16.975Z"},"score":0,"lockedOut":true},{"id":67,"name":"Seekonk","joinCode":"3l2at0nuk7qe29a31whhr95a23as7sc4","roomId":41,"createdAt":"2022-03-16T00:57:33.000Z","updatedAt":"2022-03-26T15:42:40.616Z","members":[],"Room":{"id":41,"roomName":"K-1","meetingLink":"https://prometheus.science/kepler872","createdAt":"2022-03-25T18:15:16.975Z","updatedAt":"2022-03-25T18:15:16.975Z"},"score":0,"lockedOut":false}],"opened":true,"questionNum":0,"finished":true,"buzzActive":{"id":537,"fullName":"Jerry Yuan","email":"jerryyuan696@gmail.com","googleId":"105472344416055255315","teamPosition":46597,"roomId":41,"isPlayer":true,"isMod":false,"isAdmin":false,"createdAt":"2022-03-26T05:54:06.176Z","updatedAt":"2022-03-26T15:42:40.615Z","teamId":57,"joined":false,"focused":false,"buzzing":true},"onBonus":false,"scoreboard":{"questions":[[[],[]],[[],[]],[[],[]],[[],[]],[[],[]],[[],[]],[[],[]],[[],[]],[[],[]],[[],[]],[[],[]],[[],[]],[[],[]],[[],[]],[[],[]],[[],[]],[[],[]],[[],[]],[[],[]],[[],[]],[[],[]],[[],[]],[[],[]],[[],[]]],"whoBuzzed":[[null,null],[null,null],[null,null],[null,null],[null,null],[null,null],[null,null],[null,null],[null,null],[null,null],[null,null],[null,null],[null,null],[null,null],[null,null],[null,null],[null,null],[null,null],[null,null],[null,null],[null,null],[null,null],[null,null],[null,null]],"offsets":[0,0],"currentSize":24},"questionTimer":null,"timeUp":false,"timerRunning":false,"roundNum":1,"answeringTeam":0},"42":{"teams":[{"id":119,"name":"Marquette A","joinCode":"15zoi07g6x7uhbsk2kwyixeuaoas7x97","roomId":42,"createdAt":"2022-03-22T23:19:11.949Z","updatedAt":"2022-03-26T15:42:40.614Z","members":[{"id":405,"fullName":"Sujay Vadderaju","email":"sujay.vadderaju@gmail.com","googleId":"112027875224735404810","teamPosition":734591,"roomId":42,"isPlayer":true,"isMod":false,"isAdmin":false,"createdAt":"2022-03-24T23:28:52.095Z","updatedAt":"2022-03-26T15:42:40.614Z","teamId":119,"joined":true,"focused":true,"buzzing":false},{"id":498,"fullName":"SOHAM SARAF - STUDENT","email":"ssaraf022@rsdmo.org","googleId":"113400467360470187194","teamPosition":174012,"roomId":42,"isPlayer":true,"isMod":false,"isAdmin":false,"createdAt":"2022-03-26T02:07:21.265Z","updatedAt":"2022-03-26T15:42:40.614Z","teamId":119,"joined":true,"focused":true,"buzzing":false},{"id":495,"fullName":"Andrew Wu","email":"planetmeksp@gmail.com","googleId":"115555444522874306373","teamPosition":366856,"roomId":42,"isPlayer":true,"isMod":false,"isAdmin":false,"createdAt":"2022-03-26T02:04:18.390Z","updatedAt":"2022-03-26T15:42:40.614Z","teamId":119,"joined":false,"focused":false,"buzzing":false},{"id":461,"fullName":"Arnav Busani","email":"abusani081@rsdmo.org","googleId":"104983338474623096889","teamPosition":8813,"roomId":42,"isPlayer":true,"isMod":false,"isAdmin":false,"createdAt":"2022-03-25T22:55:28.304Z","updatedAt":"2022-03-26T15:42:40.614Z","teamId":119,"joined":true,"focused":true,"buzzing":false},{"id":307,"fullName":"Ankush Vasireddy","email":"ankushvasireddy@gmail.com","googleId":"102134928904387818968","teamPosition":405917,"roomId":42,"isPlayer":true,"isMod":false,"isAdmin":false,"createdAt":"2022-03-23T00:25:02.862Z","updatedAt":"2022-03-26T15:42:40.614Z","teamId":119,"joined":true,"focused":true,"buzzing":false}],"Room":{"id":42,"roomName":"K-2","meetingLink":"https://prometheus.science/kepler872","createdAt":"2022-03-25T18:15:16.975Z","updatedAt":"2022-03-25T18:15:16.975Z"},"score":0,"lockedOut":false},{"id":128,"name":"TSA B","joinCode":"nmj5xkrbrud4rzuqyseq0q2hfxvju766","roomId":42,"createdAt":"2022-03-22T23:32:27.137Z","updatedAt":"2022-03-26T15:42:40.617Z","members":[{"id":394,"fullName":"Saket Pamidipathri","email":"psaketsrinivas@gmail.com","googleId":"104763665997946364505","teamPosition":761167,"roomId":42,"isPlayer":true,"isMod":false,"isAdmin":false,"createdAt":"2022-03-24T22:07:40.790Z","updatedAt":"2022-03-26T15:42:40.617Z","teamId":128,"joined":true,"focused":true,"buzzing":false},{"id":399,"fullName":"Thanuj Komatireddy","email":"thanujkomatireddy@gmail.com","googleId":"116511438487348794260","teamPosition":126498,"roomId":42,"isPlayer":true,"isMod":false,"isAdmin":false,"createdAt":"2022-03-24T22:15:02.017Z","updatedAt":"2022-03-26T15:42:40.617Z","teamId":128,"joined":true,"focused":true},{"id":393,"fullName":"Daniel S.","email":"neurobrainmd@gmail.com","googleId":"112467428998917157266","teamPosition":982756,"roomId":42,"isPlayer":true,"isMod":false,"isAdmin":false,"createdAt":"2022-03-24T22:07:07.204Z","updatedAt":"2022-03-26T15:42:40.617Z","teamId":128,"joined":true,"focused":true,"buzzing":false},{"id":395,"fullName":"Raymond Cai [TSA B]","email":"rcai7774@gmail.com","googleId":"115120860933556802387","teamPosition":128451,"roomId":42,"isPlayer":true,"isMod":false,"isAdmin":false,"createdAt":"2022-03-24T22:09:09.804Z","updatedAt":"2022-03-26T15:42:40.617Z","teamId":128,"joined":true,"focused":true,"buzzing":false},{"id":319,"fullName":"Jaden Penhaskashi","email":"jadennpen@gmail.com","googleId":"108553336543686658155","teamPosition":846894,"roomId":42,"isPlayer":true,"isMod":false,"isAdmin":false,"createdAt":"2022-03-23T04:31:07.398Z","updatedAt":"2022-03-26T15:42:40.617Z","teamId":128,"joined":true,"focused":true,"buzzing":false}],"Room":{"id":42,"roomName":"K-2","meetingLink":"https://prometheus.science/kepler872","createdAt":"2022-03-25T18:15:16.975Z","updatedAt":"2022-03-25T18:15:16.975Z"},"score":0,"lockedOut":false}],"opened":true,"questionNum":0,"finished":false,"buzzActive":null,"onBonus":false,"scoreboard":{"questions":[[[],[]],[[],[]],[[],[]],[[],[]],[[],[]],[[],[]],[[],[]],[[],[]],[[],[]],[[],[]],[[],[]],[[],[]],[[],[]],[[],[]],[[],[]],[[],[]],[[],[]],[[],[]],[[],[]],[[],[]],[[],[]],[[],[]],[[],[]],[[],[]]],"whoBuzzed":[[null,null],[null,null],[null,null],[null,null],[null,null],[null,null],[null,null],[null,null],[null,null],[null,null],[null,null],[null,null],[null,null],[null,null],[null,null],[null,null],[null,null],[null,null],[null,null],[null,null],[null,null],[null,null],[null,null],[null,null]],"offsets":[0,0],"currentSize":24},"questionTimer":null,"timeUp":false,"timerRunning":false,"roundNum":1,"answeringTeam":null},"43":{"teams":[{"id":29,"name":"North Hollywood A","joinCode":"kvdypyhrenauvr0fxfurhrucu1xz14y2","roomId":43,"createdAt":"2022-03-16T00:57:33.000Z","updatedAt":"2022-03-26T15:42:40.620Z","members":[{"id":577,"fullName":"Lydia Qin","email":"lingyi.qin@gmail.com","googleId":"107177860179924294852","teamPosition":454316,"roomId":43,"isPlayer":true,"isMod":false,"isAdmin":false,"createdAt":"2022-03-26T15:21:43.992Z","updatedAt":"2022-03-26T15:42:40.620Z","teamId":29,"joined":false,"focused":false,"buzzing":false},{"id":93,"fullName":"Richard Zhu","email":"rzhu666@gmail.com","googleId":"114856671133570071487","teamPosition":663149,"roomId":43,"isPlayer":true,"isMod":false,"isAdmin":false,"createdAt":"2022-03-16T04:51:19.002Z","updatedAt":"2022-03-26T15:42:40.620Z","teamId":29,"joined":true,"focused":true,"buzzing":false},{"id":212,"fullName":"Alex Franks","email":"alexkfranks@gmail.com","googleId":"106913584674750189410","teamPosition":144995,"roomId":43,"isPlayer":true,"isMod":false,"isAdmin":false,"createdAt":"2022-03-18T07:18:06.113Z","updatedAt":"2022-03-26T15:42:40.620Z","teamId":29,"joined":true,"focused":true,"buzzing":false},{"id":117,"fullName":"Camilla","email":"camillacjm04@gmail.com","googleId":"103791062063697150904","teamPosition":370168,"roomId":43,"isPlayer":true,"isMod":false,"isAdmin":false,"createdAt":"2022-03-16T05:35:27.574Z","updatedAt":"2022-03-26T15:42:40.620Z","teamId":29,"joined":true,"focused":true,"buzzing":false},{"id":108,"fullName":"Boheng Cao","email":"bcao32767@gmail.com","googleId":"117280045524168167150","teamPosition":786933,"roomId":43,"isPlayer":true,"isMod":false,"isAdmin":false,"createdAt":"2022-03-16T05:06:18.594Z","updatedAt":"2022-03-26T15:42:40.620Z","teamId":29,"joined":true,"focused":true,"buzzing":true}],"Room":{"id":43,"roomName":"K-3","meetingLink":"https://prometheus.science/kepler872","createdAt":"2022-03-25T18:15:16.975Z","updatedAt":"2022-03-25T18:15:16.975Z"},"score":14,"lockedOut":true},{"id":83,"name":"Palisades","joinCode":"iuy5fqihcdap9bw58rvbe265v9v3sb3q","roomId":43,"createdAt":"2022-03-16T00:57:33.000Z","updatedAt":"2022-03-26T15:42:40.615Z","members":[{"id":112,"fullName":"Sophie Zhu","email":"sophie.zhuyy@gmail.com","googleId":"115328980687845884308","teamPosition":340504,"roomId":43,"isPlayer":true,"isMod":false,"isAdmin":false,"createdAt":"2022-03-16T05:19:27.557Z","updatedAt":"2022-03-26T15:42:40.615Z","teamId":83,"joined":true,"focused":true,"buzzing":false},{"id":96,"fullName":"Layla Adeli","email":"2023adeli.la@pchs.palihigh.org","googleId":"103972110650891782652","teamPosition":173125,"roomId":43,"isPlayer":true,"isMod":false,"isAdmin":false,"createdAt":"2022-03-16T04:52:46.280Z","updatedAt":"2022-03-26T15:42:40.615Z","teamId":83,"joined":true,"focused":true,"buzzing":false},{"id":576,"fullName":"Michael Ajnassian","email":"2023ajnassian.mi@pchs.palihigh.org","googleId":"103130523374625493241","teamPosition":889844,"roomId":43,"isPlayer":true,"isMod":false,"isAdmin":false,"createdAt":"2022-03-26T15:21:16.982Z","updatedAt":"2022-03-26T15:42:40.615Z","teamId":83,"joined":true,"focused":true,"buzzing":false},{"id":539,"fullName":"Hemosoo Woo","email":"hemosoo.woo@gmail.com","googleId":"113717721987528574050","teamPosition":235258,"roomId":43,"isPlayer":true,"isMod":false,"isAdmin":false,"createdAt":"2022-03-26T06:06:25.122Z","updatedAt":"2022-03-26T15:42:40.615Z","teamId":83,"joined":true,"focused":true,"buzzing":false},{"id":541,"fullName":"Anirudh Chatterjee","email":"anirudhc2005@gmail.com","googleId":"116440562091327824381","teamPosition":51447,"roomId":43,"isPlayer":true,"isMod":false,"isAdmin":false,"createdAt":"2022-03-26T06:30:48.021Z","updatedAt":"2022-03-26T15:42:40.615Z","teamId":83,"joined":true,"focused":true,"buzzing":false}],"Room":{"id":43,"roomName":"K-3","meetingLink":"https://prometheus.science/kepler872","createdAt":"2022-03-25T18:15:16.975Z","updatedAt":"2022-03-25T18:15:16.975Z"},"score":0,"lockedOut":false}],"opened":true,"questionNum":1,"finished":false,"buzzActive":{"id":108,"fullName":"Boheng Cao","email":"bcao32767@gmail.com","googleId":"117280045524168167150","teamPosition":786933,"roomId":43,"isPlayer":true,"isMod":false,"isAdmin":false,"createdAt":"2022-03-16T05:06:18.594Z","updatedAt":"2022-03-26T15:42:40.620Z","teamId":29,"joined":true,"focused":true,"buzzing":true},"onBonus":false,"scoreboard":{"questions":[[[1,1],[0]],[[],[]],[[],[]],[[],[]],[[],[]],[[],[]],[[],[]],[[],[]],[[],[]],[[],[]],[[],[]],[[],[]],[[],[]],[[],[]],[[],[]],[[],[]],[[],[]],[[],[]],[[],[]],[[],[]],[[],[]],[[],[]],[[],[]],[[],[]]],"whoBuzzed":[["103791062063697150904","103130523374625493241"],[null,null],[null,null],[null,null],[null,null],[null,null],[null,null],[null,null],[null,null],[null,null],[null,null],[null,null],[null,null],[null,null],[null,null],[null,null],[null,null],[null,null],[null,null],[null,null],[null,null],[null,null],[null,null],[null,null]],"offsets":[0,0],"currentSize":24},"questionTimer":{"_idleTimeout":-1,"_idlePrev":null,"_idleNext":null,"_idleStart":2791387,"_onTimeout":null,"_repeat":null,"_destroyed":true},"timeUp":false,"timerRunning":false,"roundNum":1,"answeringTeam":0},"44":{"teams":[{"id":52,"name":"Enloe B","joinCode":"td43kvsabvhlqlveiwno2n2tkvfyo9aq","roomId":44,"createdAt":"2022-03-16T00:57:33.000Z","updatedAt":"2022-03-26T15:42:40.620Z","members":[{"id":508,"fullName":"Joseph Wan","email":"josephwan.nc@gmail.com","googleId":"114606442335582906388","teamPosition":650032,"roomId":44,"isPlayer":true,"isMod":false,"isAdmin":false,"createdAt":"2022-03-26T02:47:19.446Z","updatedAt":"2022-03-26T15:42:40.621Z","teamId":52,"joined":true,"focused":true,"buzzing":false},{"id":530,"fullName":"Madhav Karthikeyan","email":"madhavkarthikeyan06@gmail.com","googleId":"102320623365626495129","teamPosition":932579,"roomId":44,"isPlayer":true,"isMod":false,"isAdmin":false,"createdAt":"2022-03-26T05:00:46.653Z","updatedAt":"2022-03-26T15:42:40.621Z","teamId":52,"joined":true,"focused":true,"buzzing":true},{"id":203,"fullName":"Abhinav Meduri","email":"abhi.meduri@gmail.com","googleId":"116389943813940702737","teamPosition":467113,"roomId":44,"isPlayer":true,"isMod":false,"isAdmin":false,"createdAt":"2022-03-17T20:39:08.608Z","updatedAt":"2022-03-26T15:42:40.621Z","teamId":52,"joined":true,"focused":true,"buzzing":false},{"id":154,"fullName":"Thanush","email":"thanushrpatlolla@gmail.com","googleId":"101003384352337231245","teamPosition":818030,"roomId":44,"isPlayer":true,"isMod":false,"isAdmin":false,"createdAt":"2022-03-16T16:32:57.037Z","updatedAt":"2022-03-26T15:42:40.621Z","teamId":52,"joined":true,"focused":true,"buzzing":false}],"Room":{"id":44,"roomName":"L-1","meetingLink":"https://prometheus.science/lehmann802","createdAt":"2022-03-25T18:15:16.975Z","updatedAt":"2022-03-25T18:15:16.975Z"},"score":0,"lockedOut":true},{"id":26,"name":"Middleton","joinCode":"297pn9qb61y6ckm0hllyqnclm35y0wul","roomId":44,"createdAt":"2022-03-16T00:57:33.000Z","updatedAt":"2022-03-26T15:42:40.623Z","members":[{"id":481,"fullName":"Hansen Jin","email":"hansenjin2004@gmail.com","googleId":"100575921745904494735","teamPosition":976762,"roomId":44,"isPlayer":true,"isMod":false,"isAdmin":false,"createdAt":"2022-03-26T00:43:01.413Z","updatedAt":"2022-03-26T15:42:40.623Z","teamId":26,"joined":true,"focused":true},{"id":248,"fullName":"Ray Feinberg","email":"mikewine336@gmail.com","googleId":"117696341601591335572","teamPosition":799585,"roomId":44,"isPlayer":true,"isMod":false,"isAdmin":false,"createdAt":"2022-03-19T22:29:29.772Z","updatedAt":"2022-03-26T15:42:40.623Z","teamId":26,"joined":true,"focused":true},{"id":240,"fullName":"Sanjay Suresh","email":"sanjay.carnatic@gmail.com","googleId":"107392628032593791303","teamPosition":992288,"roomId":44,"isPlayer":true,"isMod":false,"isAdmin":false,"createdAt":"2022-03-19T21:54:45.423Z","updatedAt":"2022-03-26T15:42:40.623Z","teamId":26,"joined":true,"focused":true},{"id":333,"fullName":"Harry Jin [Middletong]","email":"redbirdy319@gmail.com","googleId":"102018867996103454206","teamPosition":89483,"roomId":44,"isPlayer":true,"isMod":false,"isAdmin":false,"createdAt":"2022-03-23T17:07:26.587Z","updatedAt":"2022-03-26T15:42:40.623Z","teamId":26,"joined":true,"focused":true}],"Room":{"id":44,"roomName":"L-1","meetingLink":"https://prometheus.science/lehmann802","createdAt":"2022-03-25T18:15:16.975Z","updatedAt":"2022-03-25T18:15:16.975Z"},"score":0}],"opened":true,"questionNum":0,"finished":false,"buzzActive":{"id":530,"fullName":"Madhav Karthikeyan","email":"madhavkarthikeyan06@gmail.com","googleId":"102320623365626495129","teamPosition":932579,"roomId":44,"isPlayer":true,"isMod":false,"isAdmin":false,"createdAt":"2022-03-26T05:00:46.653Z","updatedAt":"2022-03-26T15:42:40.621Z","teamId":52,"joined":true,"focused":true,"buzzing":true},"onBonus":false,"scoreboard":{"questions":[[[],[]],[[],[]],[[],[]],[[],[]],[[],[]],[[],[]],[[],[]],[[],[]],[[],[]],[[],[]],[[],[]],[[],[]],[[],[]],[[],[]],[[],[]],[[],[]],[[],[]],[[],[]],[[],[]],[[],[]],[[],[]],[[],[]],[[],[]],[[],[]]],"whoBuzzed":[[null,null],[null,null],[null,null],[null,null],[null,null],[null,null],[null,null],[null,null],[null,null],[null,null],[null,null],[null,null],[null,null],[null,null],[null,null],[null,null],[null,null],[null,null],[null,null],[null,null],[null,null],[null,null],[null,null],[null,null]],"offsets":[0,0],"currentSize":24},"questionTimer":null,"timeUp":false,"timerRunning":false,"roundNum":1,"answeringTeam":0},"45":{"teams":[{"id":86,"name":"ECHHS","joinCode":"d5aa6jii6kkghoofpla70aa6zmtnfemr","roomId":45,"createdAt":"2022-03-16T00:57:33.000Z","updatedAt":"2022-03-26T15:42:40.619Z","members":[{"id":132,"fullName":"Daniela","email":"ddanilova33@gmail.com","googleId":"110920192363405267863","teamPosition":328723,"roomId":45,"isPlayer":true,"isMod":false,"isAdmin":false,"createdAt":"2022-03-16T11:18:25.498Z","updatedAt":"2022-03-26T15:42:40.619Z","teamId":86,"joined":false,"focused":false,"buzzing":false},{"id":367,"fullName":"Rama Varanasi","email":"rvaranasi3@gmail.com","googleId":"114868679584070501378","teamPosition":334878,"roomId":45,"isPlayer":true,"isMod":false,"isAdmin":false,"createdAt":"2022-03-24T02:23:34.205Z","updatedAt":"2022-03-26T15:42:40.619Z","teamId":86,"joined":true,"focused":true,"buzzing":false},{"id":369,"fullName":"Tyler Yang","email":"tlyang@students.chccs.k12.nc.us","googleId":"111066378551923654078","teamPosition":312752,"roomId":45,"isPlayer":true,"isMod":false,"isAdmin":false,"createdAt":"2022-03-24T02:24:17.062Z","updatedAt":"2022-03-26T15:42:40.619Z","teamId":86,"joined":false,"focused":false,"buzzing":false},{"id":435,"fullName":"Benjamin McAvoy-Bickford","email":"benjaminova44@gmail.com","googleId":"108744523231370563278","teamPosition":281391,"roomId":45,"isPlayer":true,"isMod":false,"isAdmin":false,"createdAt":"2022-03-25T13:57:38.134Z","updatedAt":"2022-03-26T15:42:40.619Z","teamId":86,"joined":true,"focused":true,"buzzing":false}],"Room":{"id":45,"roomName":"L-2","meetingLink":"https://prometheus.science/lehmann802","createdAt":"2022-03-25T18:15:16.975Z","updatedAt":"2022-03-25T18:15:16.975Z"},"score":0,"lockedOut":false},{"id":64,"name":"Wootton A","joinCode":"9ca4fw5op7o9wjkcmc68ygqf4q4qu9k8","roomId":45,"createdAt":"2022-03-16T00:57:33.000Z","updatedAt":"2022-03-26T15:42:40.627Z","members":[{"id":561,"fullName":"Darek Yu","email":"darekyu2006@gmail.com","googleId":"104631055602166808756","teamPosition":152228,"roomId":45,"isPlayer":true,"isMod":false,"isAdmin":false,"createdAt":"2022-03-26T14:29:02.797Z","updatedAt":"2022-03-26T15:42:40.627Z","teamId":64},{"id":386,"fullName":"Sia Badri","email":"sia.badri@gmail.com","googleId":"100708265911825385610","teamPosition":211078,"roomId":45,"isPlayer":true,"isMod":false,"isAdmin":false,"createdAt":"2022-03-24T17:12:20.403Z","updatedAt":"2022-03-26T15:42:40.627Z","teamId":64},{"id":562,"fullName":"Armaan Salchak","email":"armaan.r.salchak@gmail.com","googleId":"106558726905171811296","teamPosition":33161,"roomId":45,"isPlayer":true,"isMod":false,"isAdmin":false,"createdAt":"2022-03-26T14:33:33.950Z","updatedAt":"2022-03-26T15:42:40.627Z","teamId":64,"joined":true,"focused":true},{"id":385,"fullName":"Digonto Chatterjee","email":"digonto.chatterjee@gmail.com","googleId":"115860441001514403123","teamPosition":699212,"roomId":45,"isPlayer":true,"isMod":false,"isAdmin":false,"createdAt":"2022-03-24T17:08:18.437Z","updatedAt":"2022-03-26T15:42:40.627Z","teamId":64,"joined":true,"focused":true},{"id":130,"fullName":"Sreejato Chatterjee","email":"sreejato.chatterjee@gmail.com","googleId":"107525348112853381805","teamPosition":502743,"roomId":45,"isPlayer":true,"isMod":false,"isAdmin":false,"createdAt":"2022-03-16T10:38:35.693Z","updatedAt":"2022-03-26T15:42:40.627Z","teamId":64,"joined":true,"focused":true},{"id":162,"fullName":"Claire Deng","email":"clairemusical2023@gmail.com","googleId":"110643713322350748575","teamPosition":989948,"roomId":45,"isPlayer":true,"isMod":false,"isAdmin":false,"createdAt":"2022-03-16T19:37:01.651Z","updatedAt":"2022-03-26T15:42:40.627Z","teamId":64,"joined":true,"focused":true}],"Room":{"id":45,"roomName":"L-2","meetingLink":"https://prometheus.science/lehmann802","createdAt":"2022-03-25T18:15:16.975Z","updatedAt":"2022-03-25T18:15:16.975Z"},"score":0}],"opened":false,"questionNum":0,"finished":false,"buzzActive":null,"onBonus":false,"scoreboard":{"questions":[[[],[]],[[],[]],[[],[]],[[],[]],[[],[]],[[],[]],[[],[]],[[],[]],[[],[]],[[],[]],[[],[]],[[],[]],[[],[]],[[],[]],[[],[]],[[],[]],[[],[]],[[],[]],[[],[]],[[],[]],[[],[]],[[],[]],[[],[]],[[],[]]],"whoBuzzed":[[null,null],[null,null],[null,null],[null,null],[null,null],[null,null],[null,null],[null,null],[null,null],[null,null],[null,null],[null,null],[null,null],[null,null],[null,null],[null,null],[null,null],[null,null],[null,null],[null,null],[null,null],[null,null],[null,null],[null,null]],"offsets":[0,0],"currentSize":24},"questionTimer":null,"timeUp":false,"timerRunning":false,"roundNum":1},"46":{"teams":[{"id":107,"name":"Green Hope","joinCode":"ev2sob7qv39qzymg675rstah52k9t9u0","roomId":46,"createdAt":"2022-03-19T21:03:18.033Z","updatedAt":"2022-03-26T15:42:40.621Z","members":[{"id":262,"fullName":"Harsh Ambardekar","email":"ambardekarharsh@gmail.com","googleId":"118074352666382404421","teamPosition":665778,"roomId":46,"isPlayer":true,"isMod":false,"isAdmin":false,"createdAt":"2022-03-20T04:22:35.915Z","updatedAt":"2022-03-26T15:42:40.621Z","teamId":107,"joined":true,"focused":true,"buzzing":false},{"id":353,"fullName":"Edward Zhang","email":"edzh06@gmail.com","googleId":"115779911309213649048","teamPosition":985856,"roomId":46,"isPlayer":true,"isMod":false,"isAdmin":false,"createdAt":"2022-03-23T22:11:08.532Z","updatedAt":"2022-03-26T15:42:40.621Z","teamId":107,"joined":true,"focused":true,"buzzing":false},{"id":280,"fullName":"Sashank Ganapathiraju","email":"sashank9912@gmail.com","googleId":"114753977491523102167","teamPosition":976674,"roomId":46,"isPlayer":true,"isMod":false,"isAdmin":false,"createdAt":"2022-03-21T03:20:10.063Z","updatedAt":"2022-03-26T15:42:40.621Z","teamId":107,"joined":true,"focused":true,"buzzing":false},{"id":352,"fullName":"Srijan Oduru","email":"srijanoduru9@gmail.com","googleId":"113616546983655324493","teamPosition":975204,"roomId":46,"isPlayer":true,"isMod":false,"isAdmin":false,"createdAt":"2022-03-23T22:11:06.283Z","updatedAt":"2022-03-26T15:42:40.621Z","teamId":107,"joined":true,"focused":true,"buzzing":false},{"id":552,"fullName":"Pranav Kosuri","email":"pranav.kosuri1@gmail.com","googleId":"103302463566891626981","teamPosition":97207,"roomId":46,"isPlayer":true,"isMod":false,"isAdmin":false,"createdAt":"2022-03-26T12:27:12.658Z","updatedAt":"2022-03-26T15:42:40.621Z","teamId":107,"joined":false,"focused":false,"buzzing":false}],"Room":{"id":46,"roomName":"L-3","meetingLink":"https://prometheus.science/lehmann802","createdAt":"2022-03-25T18:15:16.975Z","updatedAt":"2022-03-25T18:15:16.975Z"},"score":0,"lockedOut":false},{"id":91,"name":"Hopkins A","joinCode":"u80ecmqmm8zj9cdi5xekknr871pw8674","roomId":46,"createdAt":"2022-03-16T00:57:33.000Z","updatedAt":"2022-03-26T15:42:40.622Z","members":[{"id":478,"fullName":"Rohan Reddy","email":"rohanvreddy@gmail.com","googleId":"107776249773880128902","teamPosition":14684,"roomId":46,"isPlayer":true,"isMod":false,"isAdmin":false,"createdAt":"2022-03-26T00:26:30.502Z","updatedAt":"2022-03-26T15:42:40.622Z","teamId":91,"joined":true,"focused":true,"buzzing":false},{"id":186,"fullName":"Lucas Zhang","email":"lucaszhang0714@gmail.com","googleId":"102528640842871236621","teamPosition":485946,"roomId":46,"isPlayer":true,"isMod":false,"isAdmin":false,"createdAt":"2022-03-17T01:44:42.715Z","updatedAt":"2022-03-26T15:42:40.622Z","teamId":91,"joined":true,"focused":true,"buzzing":false},{"id":191,"fullName":"Ritwik Deshpande","email":"ritwik.deshpande.8@gmail.com","googleId":"111765066920678120415","teamPosition":243715,"roomId":46,"isPlayer":true,"isMod":false,"isAdmin":false,"createdAt":"2022-03-17T03:41:37.843Z","updatedAt":"2022-03-26T15:42:40.622Z","teamId":91},{"id":454,"fullName":"Jeffrey Li","email":"jeffreyli789@gmail.com","googleId":"111523263188715367263","teamPosition":690703,"roomId":46,"isPlayer":true,"isMod":false,"isAdmin":false,"createdAt":"2022-03-25T22:42:30.403Z","updatedAt":"2022-03-26T15:42:40.622Z","teamId":91},{"id":462,"fullName":"Aravind Muralidharan","email":"murali.aravind.187@gmail.com","googleId":"105872167863098023480","teamPosition":304493,"roomId":46,"isPlayer":true,"isMod":false,"isAdmin":false,"createdAt":"2022-03-25T23:00:17.251Z","updatedAt":"2022-03-26T15:42:40.622Z","teamId":91,"joined":true,"focused":true,"buzzing":false}],"Room":{"id":46,"roomName":"L-3","meetingLink":"https://prometheus.science/lehmann802","createdAt":"2022-03-25T18:15:16.975Z","updatedAt":"2022-03-25T18:15:16.975Z"},"score":0,"lockedOut":false}],"opened":true,"questionNum":0,"finished":false,"buzzActive":null,"onBonus":false,"scoreboard":{"questions":[[[],[]],[[],[]],[[],[]],[[],[]],[[],[]],[[],[]],[[],[]],[[],[]],[[],[]],[[],[]],[[],[]],[[],[]],[[],[]],[[],[]],[[],[]],[[],[]],[[],[]],[[],[]],[[],[]],[[],[]],[[],[]],[[],[]],[[],[]],[[],[]]],"whoBuzzed":[[null,null],[null,null],[null,null],[null,null],[null,null],[null,null],[null,null],[null,null],[null,null],[null,null],[null,null],[null,null],[null,null],[null,null],[null,null],[null,null],[null,null],[null,null],[null,null],[null,null],[null,null],[null,null],[null,null],[null,null]],"offsets":[0,0],"currentSize":24},"questionTimer":null,"timeUp":false,"timerRunning":false,"roundNum":1,"answeringTeam":null},"47":{"teams":[{"id":14,"name":"Centennial","joinCode":"gulosp57hqkjxbqwv2nfx7fud2bkib20","roomId":47,"createdAt":"2022-03-16T00:57:33.000Z","updatedAt":"2022-03-26T15:42:40.624Z","members":[{"id":244,"fullName":"Anurag","email":"anusoda976@gmail.com","googleId":"104421903707714227310","teamPosition":111224,"roomId":47,"isPlayer":true,"isMod":false,"isAdmin":false,"createdAt":"2022-03-19T22:06:05.658Z","updatedAt":"2022-03-26T15:42:40.624Z","teamId":14,"joined":true,"focused":true,"buzzing":false},{"id":245,"fullName":"Emily","email":"xingel2015@gmail.com","googleId":"115578725562574482586","teamPosition":959257,"roomId":47,"isPlayer":true,"isMod":false,"isAdmin":false,"createdAt":"2022-03-19T22:06:47.841Z","updatedAt":"2022-03-26T15:42:40.624Z","teamId":14,"joined":true,"focused":true,"buzzing":false},{"id":249,"fullName":"Brandon Du","email":"bdu8281@gmail.com","googleId":"107887733746893221462","teamPosition":294909,"roomId":47,"isPlayer":true,"isMod":false,"isAdmin":false,"createdAt":"2022-03-19T23:23:31.732Z","updatedAt":"2022-03-26T15:42:40.624Z","teamId":14,"joined":true,"focused":true,"buzzing":false},{"id":243,"fullName":"Atul Kashyap","email":"centennialthar@gmail.com","googleId":"102852180770576404062","teamPosition":653317,"roomId":47,"isPlayer":true,"isMod":false,"isAdmin":false,"createdAt":"2022-03-19T22:05:40.884Z","updatedAt":"2022-03-26T15:42:40.624Z","teamId":14,"joined":true,"focused":true,"buzzing":false}],"Room":{"id":47,"roomName":"M-1","meetingLink":"https://prometheus.science/mendel411","createdAt":"2022-03-25T18:15:16.975Z","updatedAt":"2022-03-25T18:15:16.975Z"},"score":0,"lockedOut":false},{"id":15,"name":"Temple City A","joinCode":"dzuyh3j9pm51roent1bugzrw25ynty3m","roomId":47,"createdAt":"2022-03-16T00:57:33.000Z","updatedAt":"2022-03-26T15:42:40.626Z","members":[{"id":358,"fullName":"Phoenix He","email":"xhe1724@tcusd.net","googleId":"113919503392157284131","teamPosition":905172,"roomId":47,"isPlayer":true,"isMod":false,"isAdmin":false,"createdAt":"2022-03-24T00:33:05.950Z","updatedAt":"2022-03-26T15:42:40.626Z","teamId":15,"joined":true,"focused":true},{"id":101,"fullName":"Jenny Chen","email":"jchen0445@tcusd.net","googleId":"101243208215937737827","teamPosition":78712,"roomId":47,"isPlayer":true,"isMod":false,"isAdmin":false,"createdAt":"2022-03-16T04:54:28.783Z","updatedAt":"2022-03-26T15:42:40.626Z","teamId":15,"joined":true,"focused":true},{"id":202,"fullName":"ryanwong","email":"ryanwong1801@gmail.com","googleId":"103475882655299442640","teamPosition":896334,"roomId":47,"isPlayer":true,"isMod":false,"isAdmin":false,"createdAt":"2022-03-17T20:20:46.587Z","updatedAt":"2022-03-26T15:42:40.626Z","teamId":15,"joined":true,"focused":true},{"id":90,"fullName":"Harrison Zhang","email":"harrisonzhang3839@gmail.com","googleId":"101307137104352922742","teamPosition":13916,"roomId":47,"isPlayer":true,"isMod":false,"isAdmin":false,"createdAt":"2022-03-16T04:50:01.639Z","updatedAt":"2022-03-26T15:42:40.626Z","teamId":15,"joined":true,"focused":true}],"Room":{"id":47,"roomName":"M-1","meetingLink":"https://prometheus.science/mendel411","createdAt":"2022-03-25T18:15:16.975Z","updatedAt":"2022-03-25T18:15:16.975Z"},"score":0}],"opened":false,"questionNum":0,"finished":false,"buzzActive":null,"onBonus":false,"scoreboard":{"questions":[[[],[]],[[],[]],[[],[]],[[],[]],[[],[]],[[],[]],[[],[]],[[],[]],[[],[]],[[],[]],[[],[]],[[],[]],[[],[]],[[],[]],[[],[]],[[],[]],[[],[]],[[],[]],[[],[]],[[],[]],[[],[]],[[],[]],[[],[]],[[],[]]],"whoBuzzed":[[null,null],[null,null],[null,null],[null,null],[null,null],[null,null],[null,null],[null,null],[null,null],[null,null],[null,null],[null,null],[null,null],[null,null],[null,null],[null,null],[null,null],[null,null],[null,null],[null,null],[null,null],[null,null],[null,null],[null,null]],"offsets":[0,0],"currentSize":24},"questionTimer":null,"timeUp":false,"timerRunning":false,"roundNum":1},"49":{"teams":[{"id":122,"name":"Hillsborough","joinCode":"odaw2vtymtev2n127zmhm6uy35c13rkr","roomId":49,"createdAt":"2022-03-22T23:20:06.192Z","updatedAt":"2022-03-26T15:42:40.624Z","members":[{"id":587,"fullName":"Charan Koltur","email":"kolturc@htps.us","googleId":"110677192618233730906","teamPosition":172487,"roomId":49,"isPlayer":true,"isMod":false,"isAdmin":false,"createdAt":"2022-03-26T15:41:26.473Z","updatedAt":"2022-03-26T15:42:40.624Z","teamId":122,"joined":true,"focused":true,"buzzing":false},{"id":315,"fullName":"Eshaan Debnath","email":"debnathe@htps.us","googleId":"114004268874458123024","teamPosition":128,"roomId":49,"isPlayer":true,"isMod":false,"isAdmin":false,"createdAt":"2022-03-23T02:59:03.598Z","updatedAt":"2022-03-26T15:42:40.624Z","teamId":122,"joined":false,"focused":false,"buzzing":false},{"id":361,"fullName":"Alexander Lin","email":"lina@htps.us","googleId":"102563109766237201809","teamPosition":678817,"roomId":49,"isPlayer":true,"isMod":false,"isAdmin":false,"createdAt":"2022-03-24T01:41:20.019Z","updatedAt":"2022-03-26T15:42:40.624Z","teamId":122,"joined":false,"focused":false,"buzzing":false}],"Room":{"id":49,"roomName":"M-3","meetingLink":"https://prometheus.science/mendel411","createdAt":"2022-03-25T18:15:16.975Z","updatedAt":"2022-03-25T18:15:16.975Z"},"score":0,"lockedOut":false},{"id":105,"name":"Quail Valley","joinCode":"wh4l16bwwmwa978hijmss8o92fbxwlks","roomId":49,"createdAt":"2022-03-19T02:29:27.195Z","updatedAt":"2022-03-26T15:42:40.625Z","members":[{"id":269,"fullName":"Ronuk Gadamsetty","email":"ronukdev@gmail.com","googleId":"114638002073867381740","teamPosition":849381,"roomId":49,"isPlayer":true,"isMod":false,"isAdmin":false,"createdAt":"2022-03-20T12:05:12.599Z","updatedAt":"2022-03-26T15:42:40.625Z","teamId":105,"joined":false,"focused":false},{"id":272,"fullName":"Srikrishna Puppala","email":"ssp.akp@gmail.com","googleId":"113317893468057290770","teamPosition":462779,"roomId":49,"isPlayer":true,"isMod":false,"isAdmin":false,"createdAt":"2022-03-20T15:06:15.589Z","updatedAt":"2022-03-26T15:42:40.625Z","teamId":105,"joined":true,"focused":true},{"id":274,"fullName":"Mahith Gottipati","email":"rocketsrimsg@gmail.com","googleId":"106704545673618462841","teamPosition":799548,"roomId":49,"isPlayer":true,"isMod":false,"isAdmin":false,"createdAt":"2022-03-20T15:43:29.632Z","updatedAt":"2022-03-26T15:42:40.625Z","teamId":105,"joined":true,"focused":true},{"id":286,"fullName":"Aanya Singh","email":"mathmatch08@gmail.com","googleId":"112981819309183364133","teamPosition":45670,"roomId":49,"isPlayer":true,"isMod":false,"isAdmin":false,"createdAt":"2022-03-21T16:28:53.425Z","updatedAt":"2022-03-26T15:42:40.625Z","teamId":105,"joined":true,"focused":true},{"id":268,"fullName":"Annika Mondal","email":"annika.mondal@gmail.com","googleId":"110964326840160791573","teamPosition":507646,"roomId":49,"isPlayer":true,"isMod":false,"isAdmin":false,"createdAt":"2022-03-20T11:17:04.173Z","updatedAt":"2022-03-26T15:42:40.625Z","teamId":105,"joined":true,"focused":true}],"Room":{"id":49,"roomName":"M-3","meetingLink":"https://prometheus.science/mendel411","createdAt":"2022-03-25T18:15:16.975Z","updatedAt":"2022-03-25T18:15:16.975Z"},"score":0}],"opened":false,"questionNum":0,"finished":false,"buzzActive":null,"onBonus":false,"scoreboard":{"questions":[[[],[]],[[],[]],[[],[]],[[],[]],[[],[]],[[],[]],[[],[]],[[],[]],[[],[]],[[],[]],[[],[]],[[],[]],[[],[]],[[],[]],[[],[]],[[],[]],[[],[]],[[],[]],[[],[]],[[],[]],[[],[]],[[],[]],[[],[]],[[],[]]],"whoBuzzed":[[null,null],[null,null],[null,null],[null,null],[null,null],[null,null],[null,null],[null,null],[null,null],[null,null],[null,null],[null,null],[null,null],[null,null],[null,null],[null,null],[null,null],[null,null],[null,null],[null,null],[null,null],[null,null],[null,null],[null,null]],"offsets":[0,0],"currentSize":24},"questionTimer":null,"timeUp":false,"timerRunning":false,"roundNum":1},"50":{"teams":[{"id":61,"name":"Nation Ford","joinCode":"p8k2wd86vd24i7xv3r0ni07p1awnazy3","roomId":50,"createdAt":"2022-03-16T00:57:33.000Z","updatedAt":"2022-03-26T15:42:40.627Z","members":[{"id":406,"fullName":"Taran Kavuru","email":"tarankavuru4@gmail.com","googleId":"107895403539681084161","teamPosition":764693,"roomId":50,"isPlayer":true,"isMod":false,"isAdmin":false,"createdAt":"2022-03-24T23:36:01.448Z","updatedAt":"2022-03-26T15:42:40.627Z","teamId":61,"joined":true,"focused":true,"buzzing":false},{"id":422,"fullName":"Ziad Baki","email":"ztbaki@gmail.com","googleId":"110135473952044242322","teamPosition":181160,"roomId":50,"isPlayer":true,"isMod":false,"isAdmin":false,"createdAt":"2022-03-25T02:33:55.473Z","updatedAt":"2022-03-26T15:42:40.627Z","teamId":61,"joined":true,"focused":true,"buzzing":false},{"id":350,"fullName":"Ethan Anderson","email":"ethan.michael.anderson@gmail.com","googleId":"106801139576055526406","teamPosition":47067,"roomId":50,"isPlayer":true,"isMod":false,"isAdmin":false,"createdAt":"2022-03-23T21:30:17.532Z","updatedAt":"2022-03-26T15:42:40.627Z","teamId":61,"joined":true,"focused":true,"buzzing":false},{"id":448,"fullName":"Jared Renneker","email":"jrenneker27@gmail.com","googleId":"117369774427194388509","teamPosition":647823,"roomId":50,"isPlayer":true,"isMod":false,"isAdmin":false,"createdAt":"2022-03-25T20:29:07.690Z","updatedAt":"2022-03-26T15:42:40.627Z","teamId":61,"joined":true,"focused":true,"buzzing":false}],"Room":{"id":50,"roomName":"N-1","meetingLink":"https://prometheus.science/newton116","createdAt":"2022-03-25T18:15:16.975Z","updatedAt":"2022-03-25T18:15:16.975Z"},"score":8,"lockedOut":false},{"id":30,"name":"Solon","joinCode":"9bazvgcnhjojkvpq630i8pb3x8ugvhcb","roomId":50,"createdAt":"2022-03-16T00:57:33.000Z","updatedAt":"2022-03-26T15:42:40.630Z","members":[{"id":178,"fullName":"Easton Singer","email":"ebs31415@gmail.com","googleId":"102953344624384445204","teamPosition":837186,"roomId":50,"isPlayer":true,"isMod":false,"isAdmin":false,"createdAt":"2022-03-17T00:42:27.547Z","updatedAt":"2022-03-26T15:42:40.630Z","teamId":30},{"id":390,"fullName":"Ethan Feldman","email":"ethanfeldman23@gmail.com","googleId":"114421253674351667656","teamPosition":222940,"roomId":50,"isPlayer":true,"isMod":false,"isAdmin":false,"createdAt":"2022-03-24T17:22:40.418Z","updatedAt":"2022-03-26T15:42:40.630Z","teamId":30,"joined":true,"focused":true,"buzzing":false},{"id":335,"fullName":"Prajval Kesireddy","email":"prajvalsantosh@gmail.com","googleId":"115292530108568217245","teamPosition":439065,"roomId":50,"isPlayer":true,"isMod":false,"isAdmin":false,"createdAt":"2022-03-23T17:35:01.936Z","updatedAt":"2022-03-26T15:42:40.630Z","teamId":30,"joined":true,"focused":true},{"id":332,"fullName":"Rohan Navaneetha","email":"batknight651@gmail.com","googleId":"109186893957146927626","teamPosition":707406,"roomId":50,"isPlayer":true,"isMod":false,"isAdmin":false,"createdAt":"2022-03-23T17:05:03.419Z","updatedAt":"2022-03-26T15:42:40.630Z","teamId":30,"joined":true,"focused":true,"buzzing":false},{"id":329,"fullName":"Brian Hong","email":"brianhong73@gmail.com","googleId":"110583091268933689569","teamPosition":16108,"roomId":50,"isPlayer":true,"isMod":false,"isAdmin":false,"createdAt":"2022-03-23T16:35:53.810Z","updatedAt":"2022-03-26T15:42:40.630Z","teamId":30,"joined":true,"focused":true}],"Room":{"id":50,"roomName":"N-1","meetingLink":"https://prometheus.science/newton116","createdAt":"2022-03-25T18:15:16.975Z","updatedAt":"2022-03-25T18:15:16.975Z"},"score":4,"lockedOut":false}],"opened":true,"questionNum":3,"finished":false,"buzzActive":null,"onBonus":true,"scoreboard":{"questions":[[[0],[0]],[[],[1,0]],[[0],[0]],[[1,0],[-1]],[[],[]],[[],[]],[[],[]],[[],[]],[[],[]],[[],[]],[[],[]],[[],[]],[[],[]],[[],[]],[[],[]],[[],[]],[[],[]],[[],[]],[[],[]],[[],[]],[[],[]],[[],[]],[[],[]],[[],[]]],"whoBuzzed":[["106801139576055526406","109186893957146927626"],[null,"114421253674351667656"],["110135473952044242322","114421253674351667656"],["117369774427194388509","114421253674351667656"],[null,null],[null,null],[null,null],[null,null],[null,null],[null,null],[null,null],[null,null],[null,null],[null,null],[null,null],[null,null],[null,null],[null,null],[null,null],[null,null],[null,null],[null,null],[null,null],[null,null]],"offsets":[0,0],"currentSize":24},"questionTimer":{"_idleTimeout":-1,"_idlePrev":null,"_idleNext":null,"_idleStart":2806025,"_onTimeout":null,"_repeat":null,"_destroyed":true},"timeUp":false,"timerRunning":false,"roundNum":1,"answeringTeam":0},"52":{"teams":[{"id":48,"name":"North Hollywood B","joinCode":"d47abrr71ahzkw8g4ib7jwhsfewrnm7m","roomId":52,"createdAt":"2022-03-16T00:57:33.000Z","updatedAt":"2022-03-26T15:42:40.628Z","members":[{"id":297,"fullName":"Daniel Hong","email":"danielhong0107@gmail.com","googleId":"104065900705702704789","teamPosition":336580,"roomId":52,"isPlayer":true,"isMod":false,"isAdmin":false,"createdAt":"2022-03-22T01:57:57.818Z","updatedAt":"2022-03-26T15:42:40.628Z","teamId":48,"joined":true,"focused":true,"buzzing":false},{"id":538,"fullName":"Joshua Lee","email":"joshjlee2006@gmail.com","googleId":"109189283401571916690","teamPosition":986200,"roomId":52,"isPlayer":true,"isMod":false,"isAdmin":false,"createdAt":"2022-03-26T06:02:10.662Z","updatedAt":"2022-03-26T15:42:40.628Z","teamId":48,"joined":true,"focused":true,"buzzing":false},{"id":254,"fullName":"Adeline","email":"adelinesun@gmail.com","googleId":"117775132774051095648","teamPosition":494289,"roomId":52,"isPlayer":true,"isMod":false,"isAdmin":false,"createdAt":"2022-03-20T00:11:16.650Z","updatedAt":"2022-03-26T15:42:40.628Z","teamId":48,"joined":true,"focused":true,"buzzing":false},{"id":215,"fullName":"Nathan Kang","email":"nathankang727@gmail.com","googleId":"116326052795315792056","teamPosition":448868,"roomId":52,"isPlayer":true,"isMod":false,"isAdmin":false,"createdAt":"2022-03-18T15:35:54.913Z","updatedAt":"2022-03-26T15:42:40.628Z","teamId":48,"joined":true,"focused":true,"buzzing":false}],"Room":{"id":52,"roomName":"N-3","meetingLink":"https://prometheus.science/newton116","createdAt":"2022-03-25T18:15:16.975Z","updatedAt":"2022-03-25T18:15:16.975Z"},"score":0,"lockedOut":false},{"id":32,"name":"SCDS","joinCode":"n8mvb3ign148p04yec5opfnafjsco4t1","roomId":52,"createdAt":"2022-03-16T00:57:33.000Z","updatedAt":"2022-03-26T15:42:40.629Z","members":[{"id":104,"fullName":"Adam Akins","email":"aakins23@scdsstudent.org","googleId":"114142639745126035251","teamPosition":276252,"roomId":52,"isPlayer":true,"isMod":false,"isAdmin":false,"createdAt":"2022-03-16T04:57:25.239Z","updatedAt":"2022-03-26T15:42:40.629Z","teamId":32,"joined":true,"focused":true},{"id":116,"fullName":"Nihal Gulati","email":"nihalsgulati@gmail.com","googleId":"112664337173271823602","teamPosition":813254,"roomId":52,"isPlayer":true,"isMod":false,"isAdmin":false,"createdAt":"2022-03-16T05:35:00.323Z","updatedAt":"2022-03-26T15:42:40.629Z","teamId":32,"joined":true,"focused":true},{"id":408,"fullName":"Saheb Gulati","email":"saheb4gulati@gmail.com","googleId":"103455206936012824764","teamPosition":312796,"roomId":52,"isPlayer":true,"isMod":false,"isAdmin":false,"createdAt":"2022-03-24T23:44:36.473Z","updatedAt":"2022-03-26T15:42:40.629Z","teamId":32,"joined":true,"focused":true},{"id":540,"fullName":"Sanjana Anand","email":"sanand22@scdsstudent.org","googleId":"115895781917018759976","teamPosition":479998,"roomId":52,"isPlayer":true,"isMod":false,"isAdmin":false,"createdAt":"2022-03-26T06:19:36.151Z","updatedAt":"2022-03-26T15:42:40.629Z","teamId":32,"joined":true,"focused":true},{"id":155,"fullName":"Samhita Kumar","email":"skumar23@scdsstudent.org","googleId":"103302574189375876597","teamPosition":332167,"roomId":52,"isPlayer":true,"isMod":false,"isAdmin":false,"createdAt":"2022-03-16T16:43:28.328Z","updatedAt":"2022-03-26T15:42:40.629Z","teamId":32,"joined":true,"focused":true}],"Room":{"id":52,"roomName":"N-3","meetingLink":"https://prometheus.science/newton116","createdAt":"2022-03-25T18:15:16.975Z","updatedAt":"2022-03-25T18:15:16.975Z"},"score":0}],"opened":true,"questionNum":0,"finished":false,"buzzActive":null,"onBonus":false,"scoreboard":{"questions":[[[],[]],[[],[]],[[],[]],[[],[]],[[],[]],[[],[]],[[],[]],[[],[]],[[],[]],[[],[]],[[],[]],[[],[]],[[],[]],[[],[]],[[],[]],[[],[]],[[],[]],[[],[]],[[],[]],[[],[]],[[],[]],[[],[]],[[],[]],[[],[]]],"whoBuzzed":[[null,null],[null,null],[null,null],[null,null],[null,null],[null,null],[null,null],[null,null],[null,null],[null,null],[null,null],[null,null],[null,null],[null,null],[null,null],[null,null],[null,null],[null,null],[null,null],[null,null],[null,null],[null,null],[null,null],[null,null]],"offsets":[0,0],"currentSize":24},"questionTimer":null,"timeUp":false,"timerRunning":false,"roundNum":1},"53":{"teams":[{"id":126,"name":"Maui","joinCode":"k1ljx8fbir2mhtbdwp4pvu8m4i7e9uha","roomId":53,"createdAt":"2022-03-22T23:30:15.795Z","updatedAt":"2022-03-26T15:42:40.648Z","members":[{"id":355,"fullName":"John Andrei Balanay","email":"johnandrei.balanay2023@mauihigh.org","googleId":"102011384327465003330","teamPosition":72542,"roomId":53,"isPlayer":true,"isMod":false,"isAdmin":false,"createdAt":"2022-03-23T23:12:11.509Z","updatedAt":"2022-03-26T15:42:40.648Z","teamId":126,"joined":true,"focused":true,"buzzing":false},{"id":324,"fullName":"Sophia Kato","email":"sophia.linh.kato@gmail.com","googleId":"104598894108394627627","teamPosition":102293,"roomId":53,"isPlayer":true,"isMod":false,"isAdmin":false,"createdAt":"2022-03-23T08:06:44.188Z","updatedAt":"2022-03-26T15:42:40.648Z","teamId":126,"joined":true,"focused":true,"buzzing":false},{"id":515,"fullName":"Camille Haluber","email":"17camille.haluber@gmail.com","googleId":"106257457609578978146","teamPosition":754972,"roomId":53,"isPlayer":true,"isMod":false,"isAdmin":false,"createdAt":"2022-03-26T03:21:04.670Z","updatedAt":"2022-03-26T15:42:40.648Z","teamId":126,"joined":true,"focused":true,"buzzing":false},{"id":365,"fullName":"Sophia Otsuka","email":"sophia.otsuka2022@mauihigh.org","googleId":"113835390470973179408","teamPosition":639086,"roomId":53,"isPlayer":true,"isMod":false,"isAdmin":false,"createdAt":"2022-03-24T01:53:52.593Z","updatedAt":"2022-03-26T15:42:40.648Z","teamId":126,"joined":true,"focused":true,"buzzing":false}],"Room":{"id":53,"roomName":"O-1","meetingLink":"https://prometheus.science/ohm616","createdAt":"2022-03-25T18:15:16.975Z","updatedAt":"2022-03-25T18:15:16.975Z"},"score":0,"lockedOut":false},{"id":40,"name":"SCGSSM A","joinCode":"81r3hoeq5tezabe1mr4y1rk9ej58763v","roomId":53,"createdAt":"2022-03-16T00:57:33.000Z","updatedAt":"2022-03-26T15:42:40.651Z","members":[{"id":199,"fullName":"Raja Villareal","email":"rajavillareal191@gmail.com","googleId":"118250679228353411007","teamPosition":332138,"roomId":53,"isPlayer":true,"isMod":false,"isAdmin":false,"createdAt":"2022-03-17T16:01:19.241Z","updatedAt":"2022-03-26T15:42:40.651Z","teamId":40,"joined":true,"focused":true},{"id":464,"fullName":"William O","email":"wostergaard22@gmail.com","googleId":"110864381877382721857","teamPosition":739891,"roomId":53,"isPlayer":true,"isMod":false,"isAdmin":false,"createdAt":"2022-03-25T23:01:38.433Z","updatedAt":"2022-03-26T15:42:40.651Z","teamId":40,"joined":true,"focused":true},{"id":153,"fullName":"Elliott Lewis","email":"elliott.c.lewis@gmail.com","googleId":"114849877370780875777","teamPosition":364305,"roomId":53,"isPlayer":true,"isMod":false,"isAdmin":false,"createdAt":"2022-03-16T16:18:58.730Z","updatedAt":"2022-03-26T15:42:40.651Z","teamId":40,"joined":true,"focused":true}],"Room":{"id":53,"roomName":"O-1","meetingLink":"https://prometheus.science/ohm616","createdAt":"2022-03-25T18:15:16.975Z","updatedAt":"2022-03-25T18:15:16.975Z"},"score":0}],"opened":false,"questionNum":0,"finished":false,"buzzActive":null,"onBonus":false,"scoreboard":{"questions":[[[],[]],[[],[]],[[],[]],[[],[]],[[],[]],[[],[]],[[],[]],[[],[]],[[],[]],[[],[]],[[],[]],[[],[]],[[],[]],[[],[]],[[],[]],[[],[]],[[],[]],[[],[]],[[],[]],[[],[]],[[],[]],[[],[]],[[],[]],[[],[]]],"whoBuzzed":[[null,null],[null,null],[null,null],[null,null],[null,null],[null,null],[null,null],[null,null],[null,null],[null,null],[null,null],[null,null],[null,null],[null,null],[null,null],[null,null],[null,null],[null,null],[null,null],[null,null],[null,null],[null,null],[null,null],[null,null]],"offsets":[0,0],"currentSize":24},"questionTimer":null,"timeUp":false,"timerRunning":false,"roundNum":1},"54":{"teams":[{"id":124,"name":"Caddo Magnet","joinCode":"gkstsw8bbv6ygadbls83yqctvi6oj0jx","roomId":54,"createdAt":"2022-03-22T23:20:44.937Z","updatedAt":"2022-03-26T15:42:40.630Z","members":[{"id":453,"fullName":"Anjali Veerareddy","email":"anjalipv1703@gmail.com","googleId":"112071840087806210953","teamPosition":698361,"roomId":54,"isPlayer":true,"isMod":false,"isAdmin":false,"createdAt":"2022-03-25T22:08:00.131Z","updatedAt":"2022-03-26T15:42:40.630Z","teamId":124,"joined":true,"focused":true,"buzzing":false},{"id":470,"fullName":"Sonya Patel","email":"sonyap405@gmail.com","googleId":"117806659651493418241","teamPosition":240347,"roomId":54,"isPlayer":true,"isMod":false,"isAdmin":false,"createdAt":"2022-03-25T23:40:26.972Z","updatedAt":"2022-03-26T15:42:40.630Z","teamId":124,"joined":false,"focused":false,"buzzing":false},{"id":517,"fullName":"Nhi Dao","email":"nhidao1885@gmail.com","googleId":"115835792832938479241","teamPosition":166990,"roomId":54,"isPlayer":true,"isMod":false,"isAdmin":false,"createdAt":"2022-03-26T03:36:12.491Z","updatedAt":"2022-03-26T15:42:40.630Z","teamId":124,"joined":true,"focused":true,"buzzing":false},{"id":325,"fullName":"Andrew Minagar","email":"aminagar@icloud.com","googleId":"103232784360776758832","teamPosition":16403,"roomId":54,"isPlayer":true,"isMod":false,"isAdmin":false,"createdAt":"2022-03-23T11:53:15.919Z","updatedAt":"2022-03-26T15:42:40.630Z","teamId":124,"joined":true,"focused":true,"buzzing":false},{"id":334,"fullName":"Raj Letchuman","email":"letchumanraj@gmail.com","googleId":"105381418257457999922","teamPosition":424357,"roomId":54,"isPlayer":true,"isMod":false,"isAdmin":false,"createdAt":"2022-03-23T17:22:44.781Z","updatedAt":"2022-03-26T15:42:40.630Z","teamId":124,"joined":true,"focused":true,"buzzing":false}],"Room":{"id":54,"roomName":"O-2","meetingLink":"https://prometheus.science/ohm616","createdAt":"2022-03-25T18:15:16.975Z","updatedAt":"2022-03-25T18:15:16.975Z"},"score":0,"lockedOut":false},{"id":49,"name":"Temple City B","joinCode":"fzi9iy6zu2q5dn4em77432c77gd946e4","roomId":54,"createdAt":"2022-03-16T00:57:33.000Z","updatedAt":"2022-03-26T15:42:40.652Z","members":[{"id":438,"fullName":"Dominique Bhatti","email":"dbhatti0730@tcusd.net","googleId":"102067845975878528789","teamPosition":69345,"roomId":54,"isPlayer":true,"isMod":false,"isAdmin":false,"createdAt":"2022-03-25T15:18:37.558Z","updatedAt":"2022-03-26T15:42:40.652Z","teamId":49,"joined":true,"focused":true},{"id":331,"fullName":"Carol Zhang","email":"czhang4681@tcusd.net","googleId":"112350057729490016436","teamPosition":849869,"roomId":54,"isPlayer":true,"isMod":false,"isAdmin":false,"createdAt":"2022-03-23T16:49:35.265Z","updatedAt":"2022-03-26T15:42:40.652Z","teamId":49,"joined":true,"focused":true},{"id":124,"fullName":"Elizabeth Hung","email":"ehung1795@tcusd.net","googleId":"110163382873482338882","teamPosition":737663,"roomId":54,"isPlayer":true,"isMod":false,"isAdmin":false,"createdAt":"2022-03-16T06:05:50.779Z","updatedAt":"2022-03-26T15:42:40.652Z","teamId":49,"joined":true,"focused":true},{"id":526,"fullName":"Mercedes Le","email":"mercedestnle@gmail.com","googleId":"109931403570066871778","teamPosition":909893,"roomId":54,"isPlayer":true,"isMod":false,"isAdmin":false,"createdAt":"2022-03-26T04:42:57.432Z","updatedAt":"2022-03-26T15:42:40.652Z","teamId":49},{"id":303,"fullName":"Eileen Yang","email":"eileenyang32@gmail.com","googleId":"112390254105054891789","teamPosition":853515,"roomId":54,"isPlayer":true,"isMod":false,"isAdmin":false,"createdAt":"2022-03-22T23:05:34.463Z","updatedAt":"2022-03-26T15:42:40.652Z","teamId":49,"joined":true,"focused":true}],"Room":{"id":54,"roomName":"O-2","meetingLink":"https://prometheus.science/ohm616","createdAt":"2022-03-25T18:15:16.975Z","updatedAt":"2022-03-25T18:15:16.975Z"},"score":0}],"opened":true,"questionNum":0,"finished":false,"buzzActive":null,"onBonus":false,"scoreboard":{"questions":[[[],[]],[[],[]],[[],[]],[[],[]],[[],[]],[[],[]],[[],[]],[[],[]],[[],[]],[[],[]],[[],[]],[[],[]],[[],[]],[[],[]],[[],[]],[[],[]],[[],[]],[[],[]],[[],[]],[[],[]],[[],[]],[[],[]],[[],[]],[[],[]]],"whoBuzzed":[[null,null],[null,null],[null,null],[null,null],[null,null],[null,null],[null,null],[null,null],[null,null],[null,null],[null,null],[null,null],[null,null],[null,null],[null,null],[null,null],[null,null],[null,null],[null,null],[null,null],[null,null],[null,null],[null,null],[null,null]],"offsets":[0,0],"currentSize":24},"questionTimer":null,"timeUp":false,"timerRunning":false,"roundNum":1},"55":{"teams":[{"id":59,"name":"Naperville North","joinCode":"uv2wpasa2xpllpwjl7hq9hkqrzjmti0m","roomId":55,"createdAt":"2022-03-16T00:57:33.000Z","updatedAt":"2022-03-26T15:42:40.649Z","members":[{"id":372,"fullName":"Andrew Tang","email":"awtang@stu.naperville203.org","googleId":"115232514521695086012","teamPosition":748615,"roomId":55,"isPlayer":true,"isMod":false,"isAdmin":false,"createdAt":"2022-03-24T03:39:40.633Z","updatedAt":"2022-03-26T15:42:40.649Z","teamId":59,"joined":true,"focused":true,"buzzing":false},{"id":91,"fullName":"Henry Xie","email":"hlxie@stu.naperville203.org","googleId":"104053186619029898045","teamPosition":72103,"roomId":55,"isPlayer":true,"isMod":false,"isAdmin":false,"createdAt":"2022-03-16T04:50:21.292Z","updatedAt":"2022-03-26T15:42:40.649Z","teamId":59,"joined":true,"focused":true,"buzzing":false},{"id":420,"fullName":"Joseph Tennyson","email":"jmtennyson7@gmail.com","googleId":"111596569070003649800","teamPosition":200506,"roomId":55,"isPlayer":true,"isMod":false,"isAdmin":false,"createdAt":"2022-03-25T01:50:48.578Z","updatedAt":"2022-03-26T15:42:40.649Z","teamId":59,"joined":true,"focused":true,"buzzing":false},{"id":421,"fullName":"Nicolas Liu","email":"nyliu@stu.naperville203.org","googleId":"106592073915387144338","teamPosition":401830,"roomId":55,"isPlayer":true,"isMod":false,"isAdmin":false,"createdAt":"2022-03-25T01:52:09.058Z","updatedAt":"2022-03-26T15:42:40.649Z","teamId":59,"joined":true,"focused":true,"buzzing":false},{"id":524,"fullName":"Ella Xu","email":"exu1@stu.naperville203.org","googleId":"103292958615950076309","teamPosition":442229,"roomId":55,"isPlayer":true,"isMod":false,"isAdmin":false,"createdAt":"2022-03-26T04:36:40.814Z","updatedAt":"2022-03-26T15:42:40.649Z","teamId":59,"joined":true,"focused":true,"buzzing":true}],"Room":{"id":55,"roomName":"O-3","meetingLink":"https://prometheus.science/ohm616","createdAt":"2022-03-25T18:15:16.975Z","updatedAt":"2022-03-25T18:15:16.975Z"},"score":0,"lockedOut":true},{"id":47,"name":"RMHS A","joinCode":"ybk6t6gbih2pf9mcuslpj5o6tmb5hi4e","roomId":55,"createdAt":"2022-03-16T00:57:33.000Z","updatedAt":"2022-03-26T15:42:40.650Z","members":[{"id":566,"fullName":"Joy Jiang","email":"joyj20160@gmail.com","googleId":"112619880103086537752","teamPosition":229851,"roomId":55,"isPlayer":true,"isMod":false,"isAdmin":false,"createdAt":"2022-03-26T15:13:02.595Z","updatedAt":"2022-03-26T15:42:40.650Z","teamId":47,"joined":true,"focused":true,"buzzing":false},{"id":92,"fullName":"Vincent","email":"endorfire7@gmail.com","googleId":"116014447634210760504","teamPosition":874860,"roomId":55,"isPlayer":true,"isMod":false,"isAdmin":false,"createdAt":"2022-03-16T04:50:48.729Z","updatedAt":"2022-03-26T15:42:40.650Z","teamId":47,"joined":true,"focused":true,"buzzing":false},{"id":511,"fullName":"Annie Guo","email":"annieguo333@gmail.com","googleId":"113952299244584832148","teamPosition":539058,"roomId":55,"isPlayer":true,"isMod":false,"isAdmin":false,"createdAt":"2022-03-26T02:56:34.183Z","updatedAt":"2022-03-26T15:42:40.650Z","teamId":47,"joined":true,"focused":true,"buzzing":false},{"id":473,"fullName":"Joseph Chen","email":"josephchen958@gmail.com","googleId":"108152382525909487295","teamPosition":939308,"roomId":55,"isPlayer":true,"isMod":false,"isAdmin":false,"createdAt":"2022-03-25T23:54:52.843Z","updatedAt":"2022-03-26T15:42:40.650Z","teamId":47,"joined":true,"focused":true,"buzzing":false}],"Room":{"id":55,"roomName":"O-3","meetingLink":"https://prometheus.science/ohm616","createdAt":"2022-03-25T18:15:16.975Z","updatedAt":"2022-03-25T18:15:16.975Z"},"score":0,"lockedOut":false}],"opened":true,"questionNum":0,"finished":false,"buzzActive":{"id":524,"fullName":"Ella Xu","email":"exu1@stu.naperville203.org","googleId":"103292958615950076309","teamPosition":442229,"roomId":55,"isPlayer":true,"isMod":false,"isAdmin":false,"createdAt":"2022-03-26T04:36:40.814Z","updatedAt":"2022-03-26T15:42:40.649Z","teamId":59,"joined":true,"focused":true,"buzzing":true},"onBonus":false,"scoreboard":{"questions":[[[],[]],[[],[]],[[],[]],[[],[]],[[],[]],[[],[]],[[],[]],[[],[]],[[],[]],[[],[]],[[],[]],[[],[]],[[],[]],[[],[]],[[],[]],[[],[]],[[],[]],[[],[]],[[],[]],[[],[]],[[],[]],[[],[]],[[],[]],[[],[]]],"whoBuzzed":[[null,null],[null,null],[null,null],[null,null],[null,null],[null,null],[null,null],[null,null],[null,null],[null,null],[null,null],[null,null],[null,null],[null,null],[null,null],[null,null],[null,null],[null,null],[null,null],[null,null],[null,null],[null,null],[null,null],[null,null]],"offsets":[0,0],"currentSize":24},"questionTimer":null,"timeUp":false,"timerRunning":false,"roundNum":1,"answeringTeam":0},"56":{"teams":[{"id":11,"name":"Iolani","joinCode":"m65vekh5rhslj0z3ugq8d69zm3lm8k17","roomId":56,"createdAt":"2022-03-16T00:57:33.000Z","updatedAt":"2022-03-26T15:42:40.653Z","members":[{"id":209,"fullName":"Jaron","email":"jmk2201@iolani.org","googleId":"105692420431138140108","teamPosition":145986,"roomId":56,"isPlayer":true,"isMod":false,"isAdmin":false,"createdAt":"2022-03-18T02:28:09.998Z","updatedAt":"2022-03-26T15:42:40.653Z","teamId":11,"joined":false,"focused":false,"buzzing":false},{"id":114,"fullName":"Justin Lu","email":"jyl2401@iolani.org","googleId":"110690127941782012293","teamPosition":377687,"roomId":56,"isPlayer":true,"isMod":false,"isAdmin":false,"createdAt":"2022-03-16T05:24:01.092Z","updatedAt":"2022-03-26T15:42:40.653Z","teamId":11,"joined":true,"focused":true,"buzzing":false},{"id":193,"fullName":"Allison Eto","email":"ake2301@iolani.org","googleId":"113391701272142422718","teamPosition":49667,"roomId":56,"isPlayer":true,"isMod":false,"isAdmin":false,"createdAt":"2022-03-17T05:35:14.427Z","updatedAt":"2022-03-26T15:42:40.653Z","teamId":11,"joined":true,"focused":true,"buzzing":false},{"id":213,"fullName":"Tyler Matsuzaki","email":"tam2201@iolani.org","googleId":"107591415181493933346","teamPosition":260147,"roomId":56,"isPlayer":true,"isMod":false,"isAdmin":false,"createdAt":"2022-03-18T07:51:28.999Z","updatedAt":"2022-03-26T15:42:40.653Z","teamId":11,"joined":true,"focused":true,"buzzing":false},{"id":391,"fullName":"Ryan Eto","email":"rme2501@iolani.org","googleId":"106172791161887099127","teamPosition":73718,"roomId":56,"isPlayer":true,"isMod":false,"isAdmin":false,"createdAt":"2022-03-24T18:50:37.804Z","updatedAt":"2022-03-26T15:42:40.653Z","teamId":11,"joined":true,"focused":true,"buzzing":false}],"Room":{"id":56,"roomName":"P-1","meetingLink":"https://prometheus.science/planck264","createdAt":"2022-03-25T18:15:16.975Z","updatedAt":"2022-03-25T18:15:16.975Z"},"score":0,"lockedOut":false},{"id":127,"name":"TSA A","joinCode":"75qzjg3pi8h60rya6up3qxui519c3c08","roomId":56,"createdAt":"2022-03-22T23:32:21.485Z","updatedAt":"2022-03-26T15:42:40.655Z","members":[{"id":392,"fullName":"SUREN GRIGORIAN","email":"sgrigoria0001@mymail.lausd.net","googleId":"113352995268667025678","teamPosition":110859,"roomId":56,"isPlayer":true,"isMod":false,"isAdmin":false,"createdAt":"2022-03-24T22:01:45.373Z","updatedAt":"2022-03-26T15:42:40.655Z","teamId":127,"joined":true,"focused":true},{"id":398,"fullName":"NIKITA AKCHYAN","email":"nakchyan0001@mymail.lausd.net","googleId":"100467354541656300246","teamPosition":88499,"roomId":56,"isPlayer":true,"isMod":false,"isAdmin":false,"createdAt":"2022-03-24T22:11:49.546Z","updatedAt":"2022-03-26T15:42:40.655Z","teamId":127},{"id":396,"fullName":"NAIRA BADALYAN","email":"nbadalyan0001@mymail.lausd.net","googleId":"110409757238072893760","teamPosition":10019,"roomId":56,"isPlayer":true,"isMod":false,"isAdmin":false,"createdAt":"2022-03-24T22:09:27.153Z","updatedAt":"2022-03-26T15:42:40.655Z","teamId":127},{"id":397,"fullName":"Needham, James","email":"jamestiberius6.626@gmail.com","googleId":"106878667496501930416","teamPosition":298041,"roomId":56,"isPlayer":true,"isMod":false,"isAdmin":false,"createdAt":"2022-03-24T22:11:23.993Z","updatedAt":"2022-03-26T15:42:40.655Z","teamId":127,"joined":true,"focused":true},{"id":516,"fullName":"David Tang","email":"davidtang91352@gmail.com","googleId":"103944592636977807195","teamPosition":410309,"roomId":56,"isPlayer":true,"isMod":false,"isAdmin":false,"createdAt":"2022-03-26T03:21:38.642Z","updatedAt":"2022-03-26T15:42:40.655Z","teamId":127,"joined":true,"focused":true}],"Room":{"id":56,"roomName":"P-1","meetingLink":"https://prometheus.science/planck264","createdAt":"2022-03-25T18:15:16.975Z","updatedAt":"2022-03-25T18:15:16.975Z"},"score":0}],"opened":false,"questionNum":0,"finished":false,"buzzActive":null,"onBonus":false,"scoreboard":{"questions":[[[],[]],[[],[]],[[],[]],[[],[]],[[],[]],[[],[]],[[],[]],[[],[]],[[],[]],[[],[]],[[],[]],[[],[]],[[],[]],[[],[]],[[],[]],[[],[]],[[],[]],[[],[]],[[],[]],[[],[]],[[],[]],[[],[]],[[],[]],[[],[]]],"whoBuzzed":[[null,null],[null,null],[null,null],[null,null],[null,null],[null,null],[null,null],[null,null],[null,null],[null,null],[null,null],[null,null],[null,null],[null,null],[null,null],[null,null],[null,null],[null,null],[null,null],[null,null],[null,null],[null,null],[null,null],[null,null]],"offsets":[0,0],"currentSize":24},"questionTimer":null,"timeUp":false,"timerRunning":false,"roundNum":1},"58":{"teams":[{"id":43,"name":"North Allegheny","joinCode":"52y36bnwo9hirjwg8hohrxpygrgc4dl2","roomId":58,"createdAt":"2022-03-16T00:57:33.000Z","updatedAt":"2022-03-26T15:42:40.653Z","members":[{"id":141,"fullName":"Praneeth Otthi","email":"praneethotthipersonal@gmail.com","googleId":"108121563988463645667","teamPosition":179320,"roomId":58,"isPlayer":true,"isMod":false,"isAdmin":false,"createdAt":"2022-03-16T12:33:00.428Z","updatedAt":"2022-03-26T15:42:40.653Z","teamId":43,"joined":true,"focused":true,"buzzing":false},{"id":477,"fullName":"Haresh M.","email":"hmuralidharan@nastudents.org","googleId":"100668533196851831063","teamPosition":615415,"roomId":58,"isPlayer":true,"isMod":false,"isAdmin":false,"createdAt":"2022-03-26T00:22:04.934Z","updatedAt":"2022-03-26T15:42:40.653Z","teamId":43,"joined":true,"focused":true,"buzzing":false},{"id":151,"fullName":"Neelansh Samanta","email":"nsamanta@nastudents.org","googleId":"109338311861383994000","teamPosition":907595,"roomId":58,"isPlayer":true,"isMod":false,"isAdmin":false,"createdAt":"2022-03-16T15:20:33.872Z","updatedAt":"2022-03-26T15:42:40.653Z","teamId":43,"joined":true,"focused":true,"buzzing":false},{"id":447,"fullName":"Edward M","email":"emei@nastudents.org","googleId":"114717464698957846793","teamPosition":452388,"roomId":58,"isPlayer":true,"isMod":false,"isAdmin":false,"createdAt":"2022-03-25T20:16:38.461Z","updatedAt":"2022-03-26T15:42:40.653Z","teamId":43,"joined":true,"focused":true,"buzzing":false},{"id":131,"fullName":"Gautam Ramkumar","email":"gramkumar@nastudents.org","googleId":"108232523690685466786","teamPosition":936717,"roomId":58,"isPlayer":true,"isMod":false,"isAdmin":false,"createdAt":"2022-03-16T11:14:16.974Z","updatedAt":"2022-03-26T15:42:40.653Z","teamId":43,"joined":true,"focused":true,"buzzing":false}],"Room":{"id":58,"roomName":"P-3","meetingLink":"https://prometheus.science/planck264","createdAt":"2022-03-25T18:15:16.975Z","updatedAt":"2022-03-25T18:15:16.975Z"},"score":0,"lockedOut":false},{"id":62,"name":"Princeton","joinCode":"o7o9gwmp8grymxbvcwg7zaq5bk2y567s","roomId":58,"createdAt":"2022-03-16T00:57:33.000Z","updatedAt":"2022-03-26T15:42:40.654Z","members":[{"id":567,"fullName":"George Kopf","email":"gkopf@princetonk12.org","googleId":"100589148649858748300","teamPosition":143524,"roomId":58,"isPlayer":true,"isMod":false,"isAdmin":false,"createdAt":"2022-03-26T15:13:27.952Z","updatedAt":"2022-03-26T15:42:40.654Z","teamId":62,"joined":true,"focused":true},{"id":560,"fullName":"Eric Zhu","email":"zhueric2004@gmail.com","googleId":"110580304168833666795","teamPosition":774239,"roomId":58,"isPlayer":true,"isMod":false,"isAdmin":false,"createdAt":"2022-03-26T14:25:56.680Z","updatedAt":"2022-03-26T15:42:40.654Z","teamId":62,"joined":true,"focused":true},{"id":188,"fullName":"George Kopf","email":"georgekopf5@gmail.com","googleId":"111855101095867741364","teamPosition":668604,"roomId":58,"isPlayer":true,"isMod":false,"isAdmin":false,"createdAt":"2022-03-17T02:40:28.874Z","updatedAt":"2022-03-26T15:42:40.654Z","teamId":62},{"id":167,"fullName":"Samuel Whitley","email":"swhitley.princeton@gmail.com","googleId":"111995383688812556866","teamPosition":619358,"roomId":58,"isPlayer":true,"isMod":false,"isAdmin":false,"createdAt":"2022-03-16T21:25:41.202Z","updatedAt":"2022-03-26T15:42:40.654Z","teamId":62,"joined":true,"focused":true},{"id":298,"fullName":"Ethan Lee","email":"elee@princetonk12.org","googleId":"101155681821257795257","teamPosition":604503,"roomId":58,"isPlayer":true,"isMod":false,"isAdmin":false,"createdAt":"2022-03-22T02:12:36.264Z","updatedAt":"2022-03-26T15:42:40.654Z","teamId":62,"joined":true,"focused":true},{"id":564,"fullName":"David Yang","email":"davidyang438@gmail.com","googleId":"111407766013283262690","teamPosition":810900,"roomId":58,"isPlayer":true,"isMod":false,"isAdmin":false,"createdAt":"2022-03-26T14:39:24.471Z","updatedAt":"2022-03-26T15:42:40.654Z","teamId":62}],"Room":{"id":58,"roomName":"P-3","meetingLink":"https://prometheus.science/planck264","createdAt":"2022-03-25T18:15:16.975Z","updatedAt":"2022-03-25T18:15:16.975Z"},"score":0}],"opened":false,"questionNum":0,"finished":false,"buzzActive":null,"onBonus":false,"scoreboard":{"questions":[[[],[]],[[],[]],[[],[]],[[],[]],[[],[]],[[],[]],[[],[]],[[],[]],[[],[]],[[],[]],[[],[]],[[],[]],[[],[]],[[],[]],[[],[]],[[],[]],[[],[]],[[],[]],[[],[]],[[],[]],[[],[]],[[],[]],[[],[]],[[],[]]],"whoBuzzed":[[null,null],[null,null],[null,null],[null,null],[null,null],[null,null],[null,null],[null,null],[null,null],[null,null],[null,null],[null,null],[null,null],[null,null],[null,null],[null,null],[null,null],[null,null],[null,null],[null,null],[null,null],[null,null],[null,null],[null,null]],"offsets":[0,0],"currentSize":24},"questionTimer":null,"timeUp":false,"timerRunning":false,"roundNum":1}};

function roomUpdate(roomId, googleId) {
    try {
        let game = currentGames[roomId];
        if (game) {
            let updateCode = gen.genUpdateCode();
            console.log(chalk.green(`Sending an update after action from ${googleId}: code ${updateCode}`));
            io.to(roomId).emit('update', {
                ...game.state(),
                updateCode
            });
            logger.append(`Update code: ${updateCode}\n${JSON.stringify(game.state())}`);
        } else {
            console.error(chalk.red('Attempted to update game state when game does not exist'));
        }
    } catch (err) {
        console.error(chalk.red(err));
    }
}

const unassignedMessage = {
    errorCode: 'noassign',
    errorMessage: 'User is not assigned to this room.'
};

function disconnectAllSockets() {
    io.emit('joinerr', unassignedMessage);
    io.disconnectSockets();
}

io.on('connection', async socket => {
    let user = await authSocket(socket);
    if (!user) {
        console.log('Unauthed user tried to join websocket');
        socket.emit('joinerr', {
            errorCode: 'unauthed',
            errorMessage: 'Could not successfully authenticate user.'
        });
        return;// TODO: IN PRODUCTION PLEASE UNCOMMENT THIS FOR THE LOVE OF GOD
    }
    socket.emit('authorized');
    socket.on('join', async data => {
        /*if (data.authToken) { // FOR THE LOVE OF GOD CHANGE
            user = await db.findUserWithAuthToken(data.authToken);
            user.googleId = 'DEBUG_GID';
        }*/
        try {
            console.log('Request to join.');
            let roomId = parseInt(data.room);
            
            if (user.isPlayer && user.roomId !== roomId) {
                socket.emit('joinerr', unassignedMessage);
                return;
            }
            let roomWarning = false;
            if (user.isMod && user.roomId !== roomId) {
                if (process.env.TRUST_MODS === 'on') {
                    console.warn('Moderator is joining an unassigned room.');
                    roomWarning = true;
                } else {
                    console.warn('Moderator is being prevented from joining an unassigned room.');
                    socket.emit('joinerr', unassignedMessage);
                }
            }
            socket.join(roomId);
            let room = await db.findRoomWithId(roomId);
            if (!room) return;
            let nextRoom = await room.get({ plain: true });
            let game = null;
            if (data.room in currentGames) {
                if (user.isPlayer) {
                    currentGames[data.room].setJoined(user.googleId, true);
                }
                game = currentGames[data.room];
                nextRoom.game = game.state();
            } else {
                nextRoom.game = null;
            }
            function send(a, b) {
                try {
                    let g = currentGames[roomId];
                    if (g) {
                        if (b) {
                            io.to(roomId).emit(a, b);
                        } else {
                            io.to(roomId).emit(a);
                        }
                    }
                } catch (err) {
                    console.error(chalk.red(err));
                }
            }
            function broadcast(val) {
                if (!val) return false;
                if (val.length > 1) {
                    let msg = val[0];
                    let data = val[1];
                    send(msg, data);
                    return true;
                } else if (val.length > 0) {
                    let msg = val[0];
                    send(msg);
                    return true;
                }
                return false;
            }
            console.log('Successfully joined');
            if (!game) {
                console.warn(chalk.yellow('Game not found.'));
                return;
            }
            try {
                let found = game.findGoogleID(user.googleId);
                socket.emit('joined', {
                    room: nextRoom,
                    user: userInfo(user),
                    teamIndex: found ? found[1] : null,
                    roomWarning: roomWarning // if TRUST_MODS is on, a warning message will be displayed to mods when they join a room they are not assigned to.  Otherwise, they will be prevented from joining.
                });
                roomUpdate(roomId, user.googleId);
            } catch (err) {
                console.error(chalk.red(err));
                console.trace(err);
            }
            
            socket.on('disconnect', () => {
                try {
                    let g = currentGames[roomId];
                    if (g) {
                        g.setJoined(user.googleId, false);
                        roomUpdate(roomId, user.googleId);
                    }
                } catch (err) {
                    console.error(chalk.red(err));
                    console.trace(err);
                }
            });

            socket.onAny((eventName) => {
                console.log(`Received event from user ${user.googleId}: ${eventName}`);
            });

            // TODO: change this back FOR THE LOVE OF GOD
            if (user.isPlayer) {
            //if (user.isPlayer || user.isAdmin) {
                socket.on('buzz', async () => {
                    let g = currentGames[roomId];
                    try {
                        console.log('Buzz sent');
                        let hasMessage = broadcast(g.buzz(user.googleId));
                        if (hasMessage) {
                            console.log('Buzz successful');
                            roomUpdate(roomId, user.googleId);
                        }
                    } catch (err) {
                        console.error(chalk.red(err));
                    }
                });
                // TODO: BRING BACK FOR ANTI-CHEAT RED
                /*socket.on('focus', async () => {
                    try {
                        let g = currentGames[roomId];
                        //console.log(user);
                        g.setPlayedFocused(user.googleId, true);
                        roomUpdate(roomId, user.googleId);
                    } catch (err) {
                        console.error(chalk.red(err));
                        console.trace(err);
                    }
                });
                socket.on('blur', async () => {
                    try {
                        let g = currentGames[roomId];
                        g.setPlayedFocused(user.googleId, false);
                        roomUpdate(roomId, user.googleId);
                    } catch (err) {
                        console.error(chalk.red(err));
                        console.trace(err);
                    }
                });*/
            }
            if (user.isMod || user.isAdmin) {
                socket.on('start', async () => {
                    try {
                        let g = currentGames[roomId];
                        if (g) {
                            g.start();
                            roomUpdate(roomId, user.googleId);
                        }
                    } catch (err) {
                        console.error(chalk.red(err));
                        console.trace(err);
                    }
                });
                socket.on('end', async () => {
                    try {
                        let g = currentGames[roomId];
                        g.end();
                        roomUpdate(roomId, user.googleId);
                        gameSave(roomId);
                    } catch (err) {
                        console.error(chalk.red(err));
                    }
                });
                
                socket.on('ignorebuzz', async () => {
                    try {
                        let g = currentGames[roomId];
                        g.ignoreBuzz();
                        roomUpdate(roomId, user.googleId);
                    } catch (err) {
                        console.error(chalk.red(err));
                    }
                });
                socket.on('correctanswer', async () => {
                    try {
                        let g = currentGames[roomId];
                        broadcast(g.correctLive());
                        roomUpdate(roomId, user.googleId);
                    } catch (err) {
                        console.error(chalk.red(err));
                    }
                });
                socket.on('incorrectanswer', async () => {
                    try {
                        let g = currentGames[roomId];
                        let onBonus = g.onBonus;
                        let wereAllLocked = g.incorrectLive();
                        if (onBonus) {
                            send('timercancel');
                        } else if (!wereAllLocked) {
                            broadcast(g.startTimer(() => {
                                roomUpdate(roomId, user.googleId);
                            }));
                        }
                        roomUpdate(roomId, user.googleId);
                    } catch (err) {
                        console.error(chalk.red(err));
                        console.trace(err);
                        console.log('LOOK HERE');
                    }
                });
                socket.on('neganswer', async () => {
                    try {
                        let g = currentGames[roomId];
                        console.log('Neg');
                        g.negLive();
                        roomUpdate(roomId, user.googleId);
                    } catch (err) {
                        console.error(chalk.red(err));
                    }
                });
                
                socket.on('set-correct', ({questionNum, teamInd, isBonus}) => {
                    try {
                        let g = currentGames[roomId];
                        console.log(`Correct ${teamInd}`);
                        g.correctAnswer(questionNum, null, teamInd, isBonus);
                        roomUpdate(roomId, user.googleId);
                    } catch (err) {
                        console.error(chalk.red(err));
                    }
                });
                socket.on('set-incorrect', ({questionNum, teamInd, isBonus}) => {
                    try {
                        let g = currentGames[roomId];
                        console.log(`Incorrect ${teamInd}`)
                        g.incorrectAnswer(questionNum, null, teamInd, isBonus);
                        roomUpdate(roomId, user.googleId);
                    } catch (err) {
                        console.error(chalk.red(err));
                    }
                });
                socket.on('set-neg', ({questionNum, teamInd}) => {
                    try {
                        let g = currentGames[roomId];
                        console.log(`Negging ${teamInd}`);
                        g.negAnswer(questionNum, null, teamInd);
                        roomUpdate(roomId, user.googleId);
                    } catch (err) {
                        console.error(chalk.red(err));
                    }
                });
                socket.on('set-no-buzz', ({questionNum, teamInd}) => {
                    try {
                        let g = currentGames[roomId];
                        console.log(`No buzz ${teamInd}`);
                        g.noAnswer(questionNum, teamInd);
                        roomUpdate(roomId, user.googleId);
                    } catch (err) {
                        console.error(chalk.red(err));
                    }
                });
                
                socket.on('next-question', async () => {
                    try {
                        let g = currentGames[roomId];
                        broadcast(g.nextQuestion());
                        roomUpdate(roomId, user.googleId);
                    } catch (err) {
                        console.error(chalk.red(err));
                    }
                });
                socket.on('set-question-num', async num => {
                    try {
                        let g = currentGames[roomId];
                        broadcast(g.setQuestionNum(num));
                        roomUpdate(roomId, user.googleId);
                    } catch (err) {
                        console.error(chalk.red(err));
                    }
                });
                socket.on('set-on-bonus', isBonus => {
                    try {
                        let g = currentGames[roomId];
                        broadcast(g.setOnBonus(isBonus));
                        roomUpdate(roomId, user.googleId);
                    } catch (err) {
                        console.error(chalk.red(err));
                    }
                });
                socket.on('set-locked', ({ teamInd, locked }) => {
                    try {
                        let g = currentGames[roomId];
                        g.setLocked(teamInd, locked);
                        roomUpdate(roomId, user.googleId);
                    } catch (err) {
                        console.error(chalk.red(err));
                    }
                });
                
                socket.on('req_starttimer', () => {
                    try {
                        let g = currentGames[roomId];
                        if (g.timerRunning) return;
                        broadcast(g.startTimer(wasBonus => {
                            console.log('timer done!');
                            roomUpdate(roomId, user.googleId);
                        }));
                        roomUpdate(roomId, user.googleId);
                    } catch (err) {
                        console.error(chalk.red(err));
                    }
                });
                
                socket.on('req_canceltimer', () => {
                    try {
                        let g = currentGames[roomId];
                        if (!g.timerRunning) return;
                        broadcast(g.cancelTimer());
                        roomUpdate(roomId, user.googleId);
                    } catch (err) {
                        console.error(chalk.red(err));
                    }
                });

                socket.on('set-offset', ({teamInd, amount}) => {
                    try {
                        let g = currentGames[roomId];
                        g.setOffset(teamInd, amount);
                        roomUpdate(roomId, user.googleId);
                    } catch (err) {
                        console.error(chalk.red(err));
                    }
                });
                
            }
        } catch (err) {
            console.error(chalk.red(err));
            console.trace(err);
        }
    });
});

setInterval(() => {
    console.log('Sending periodic log of currentGames');
    logger.append(`Periodic log of currentGames:\n${JSON.stringify(currentGames)}`);
}, 60*1000);

const MOD_JOIN_CODE = process.env.MOD_JOIN_CODE;
const ADMIN_JOIN_CODE = process.env.ADMIN_JOIN_CODE;

const INVALID_TOKEN = {
    success: false,
    errorCode: 'errInvalidToken',
    errorMessage: 'Sorry, your session token is either invalid or missing.'
};

const INTERNAL = {
    success: false,
    errorCode: 'errInternal',
    errorMessage: 'Sorry, an internal server error occured.'
};

const NO_PERMS = {
    success: false,
    errorCode: 'errNoPerms',
    errorMessage: 'You do not have sufficient permissions to do this.'
};

app.post('/api/check-code', async (req, res) => {
    try {
        console.log('check code');
        let code = req.body.code;
        if (code === MOD_JOIN_CODE) {
            res.send({
                success: true,
                role: 'mod'
            });
        } else if (code === ADMIN_JOIN_CODE) {
            res.send({
                success: true,
                role: 'admin'
            });
        } else {
            // Search for join code's team and send the team name back
            let team = await db.findTeamWithJoinCode(code);
            if (team) {
                res.send({
                    success: true,
                    role: 'player',
                    teamName: team.name
                });
            } else {
                res.send({
                    success: false,
                    role: null,
                    errorCode: 'errInvalidCode',
                    errorMessage: 'Code could not be found.'
                });
            }
        }
    } catch (err) {
        console.error(chalk.red(`Error checking code: ${err}`));
    }
});

app.post('/api/user-info', async (req, res) => {
    try {
        let token = req.body.googleToken;
        const ticket = await client.verifyIdToken({
            idToken: token,
            audience: process.env.CLIENT_ID
        });
        const { name, email, picture, sub } = ticket.getPayload();
        // USE SUB FOR USER ID
        res.send({
            success: true,
            name,
            email,
            picture
        });
    } catch (err) {
        console.error(`Error getting user info: ${err}`);
        res.send({
            success: false,
            errorMessage: 'Error getting user info. The OAuth token is probably invalid.'
        });
    }
});

async function assignToken(req, res, user) {
    try {
        let token = gen.genSessionToken();
        /*req.session.token = token;
        req.session.created = Date.now();*/
        res.cookie('authtoken', token, {
            expires: new Date(2147483647 * 1000), // maximum expiry date
            httpOnly: true,
            secure: (process.env.SECURE !== 'off'),
            signed: true
        });
        await db.addToken(user, token);
        return token;
    } catch (err) {
        console.error(chalk.red(`Error assigning token: ${err}`));
        return null;
    }
}

app.post('/api/join', async (req, res) => {
    try {
        let code = req.body.code;
        let fullName = req.body.fullName;
        let googleAuthToken = req.body.googleToken;
        const ticket = await client.verifyIdToken({
            idToken: googleAuthToken,
            audience: process.env.CLIENT_ID
        });
        const payload = ticket.getPayload();
        let previous = await db.findUserWithGID(payload.sub);
        if (previous !== null) {
            res.send({
                success: false,
                errorCode: 'errAlreadyExists',
                errorMessage: 'Sorry, a user has already been created with this Google account.'
            });
            return;
        }
        let toSend = {
            success: true,
            fullName,
            email: payload.email,
            picture: payload.picture,
            googleId: payload.sub
        };
        let success = true;
        let user = null;
        if (code === MOD_JOIN_CODE) {
            user = await db.addMod(fullName, payload);
            toSend.role = 'mod';
        } else if (code === ADMIN_JOIN_CODE) {
            user = await db.addAdmin(fullName, payload);
            toSend.role = 'admin';
        } else {
            // Search for join code's team
            let team = await db.findTeamWithJoinCode(code);
            if (team) {
                user = await db.addTeamMember(team, fullName, payload);
                toSend.role = 'player';
            } else {
                // If nothing found
                res.send({
                    success: false,
                    errorCode: 'errInvalidCode',
                    errorMessage: 'This join code was not recognized.'
                });
                success = false;
            }
        }
        if (success) {
            let token = await assignToken(req, res, user);
            toSend.token = token;
            res.send(toSend);
        }
    } catch (err) {
        console.error(chalk.red(`Error joining: ${err}`));
    }
});

function userInfo(user) {
    try {
        let role = db.getRole(user);
        return {
            fullName: user.fullName,
            email: user.email,
            teamPosition: user.teamPosition,
            roomId: user.roomId,
            isPlayer: user.isPlayer,
            isMod: user.isMod,
            isAdmin: user.isAdmin,
            team: user.Team,
            role
        };
    } catch (err) {
        console.error(chalk.red(`Error getting user info: ${err}`));
        return null;
    }
}

app.post('/api/signin', async (req, res) => {
    try {
        let googleAuthToken = req.body.googleToken;
        const ticket = await client.verifyIdToken({
            idToken: googleAuthToken,
            audience: process.env.CLIENT_ID
        });
        const payload = ticket.getPayload();
        let googleId = payload.sub;
        let user = await db.findUserWithGID(googleId);
        if (user) {
            let token = await assignToken(req, res, user);
            res.send({
                success: true,
                isAuthed: true,
                token,
                user: userInfo(user)
            });
        } else {
            res.send({
                success: false,
                isAuthed: false,
                errorCode: 'errUserNotFound',
                errorMessage: 'Existing user with this Google account could not be found'
            });
        }
    } catch (err) {
        console.error(chalk.red(`Error signing in: ${err}`));
    }
});

app.post('/api/signout', async (req, res) => {
    try {
        console.log('Signing out');
        res.clearCookie('authtoken');
        res.send({
            success: true
        });
    } catch (err) {
        console.error(chalk.red(`Error signing out: ${err}`));
    }
});

async function authUser(req) {
    try {
        let token = req.signedCookies.authtoken;
        if (!token) return null;
        let user = await db.findUserWithAuthToken(token);
        return user;
    } catch (err) {
        console.error(`Error authenticating user: ${err}`);
    }
}

app.get('/api/auth', async (req, res) => {
    try {
        let user = await authUser(req);
        if (user) {
            let role = db.getRole(user);
            res.send({
                success: true,
                isAuthed: true,
                user: userInfo(user)
            });
        } else {
            res.send({
                success: true,
                isAuthed: false,
                user: null
            });
        }
    } catch (err) {
        console.error(chalk.red(`Error authenticating: ${err}`));
    }
});

app.get('/api/get-room', async (req, res) => {
    try {
        let user = await authUser(req);
        if (!user) {
            res.send(INVALID_TOKEN);
            return;
        }
        // If you're an admin, you don't have room assignments
        if (user.isAdmin) {
            res.send({
                success: false,
                errorCode: 'errIsAdmin',
                errorMessage: 'Admins don\'t have room assignments.'
            });
            return;
        }
        let roomId = user.roomId;
        let hasRoom = (roomId !== null);
        res.send({
            success: true,
            hasRoom,
            roomId
        });
    } catch (err) {
        console.error(chalk.red(`Error getting room: ${err}`));
    }
});

app.post('/api/create-team', async (req, res) => {
    try {
        let user = await authUser(req);
        if (!user) {
            res.send(INVALID_TOKEN);
            return;
        }
        if (!user.isAdmin) {
            res.send(NO_PERMS);
            return;
        }
        let teamName = req.body.teamName;
        let joinCode = gen.genJoinCode();
        await db.createTeam(teamName, joinCode);
        res.send({
            success: true,
            teamName,
            joinCode
        });
    } catch (err) {
        console.error(`Error creating team: ${err}`);
        res.send(INTERNAL);
    }
});

app.get('/api/tournament-info', async (req, res) => {
    try {
        let user = await authUser(req);
        if (!user) {
            res.send(INVALID_TOKEN);
            return;
        }
        if (!user.isAdmin) {
            res.send(NO_PERMS);
        }
        let tournamentInfo = await db.getTournamentInfo();
        res.send(tournamentInfo);
    } catch (err) {
        res.send(INTERNAL);
        console.error(err);
    }
});

app.post('/api/start-tournament', async (req, res) => {
    try {
        console.log('Request to start the tournament');
        let user = await authUser(req);
        if (!user) {
            res.send(INVALID_TOKEN);
            return;
        }
        if (!user.isAdmin) {
            res.send(NO_PERMS);
        }
        let worked = await autoRound.startTournament();
        if (worked) {
            res.send({
                success: true,
                currentRound: 1
            });
            await createGames(1);
        } else {
            res.send({
                success: false,
                errorCode: 'errAlreadyStarted',
                errorMessage: 'Can\'t start the tournament because it\'s already started!'
            });
        }
    } catch (err) {
        console.error(`Error starting the tournament: ${err}`);
        res.send(INTERNAL);
    }
});

async function gameSave(roomId) {
    try {
        let game = currentGames[roomId];
        let roundNum = game.roundNum;
        game.updateScores();
        let teams = game.teams;
        let gameRecord = await db.createGameRecord(roundNum, roomId, teams);
        return await db.saveToGameRecord(gameRecord.id, teams, game.scoreboard);
    } catch (err) {
        console.error(`Database saving games error: ${chalk.red(err)}`);
    }
}

async function saveGames() {
    let arr = Object.keys(currentGames);
    if (arr.length > 0) {
        let roundNum = currentGames[arr[0]].roundNum;
        await autoRound.saveScores(currentGames, roundNum)
    }
    let promises = [];
    for (let roomId in currentGames) {
        if (!currentGames[roomId].active()) continue;
        let game = gameSave(roomId);
        if (game) {
            promises.push(game);
        }
    }
    return promises;
}

async function createGames(roundNum) {
    try {
        console.log(chalk.green('Create games has been called.'));
        disconnectAllSockets();
        let teams = await db.listTeams();
        teams.sort((a, b) => a.name.localeCompare(b.name));
        currentGames = {};
        for (let team of teams) {
            team = await team.get({ plain: true })
            let roomId = team.roomId;
            if (roomId === null) continue;
            if (roomId in currentGames) {
                let game = currentGames[roomId];
                if (game.teamB() !== null) {
                    console.warn('More than two teams assigned to the same room.');
                    continue;
                }
                game.setTeamB(team);
            } else {
                currentGames[roomId] = new Game(team, null, roundNum);
            }
        }
        for (let roomId in currentGames) {
            let game = currentGames[roomId];
            if (game.teams[0] === null || game.teams[1] === null) {
                console.warn(chalk.yellow(`Warning: game on room ${roomId} is being deleted because it does not have two teams.`));
                delete currentGames[roomId];
            }
        }
    } catch (err) {
        console.error(chalk.red(`Error creating games: ${err}`));
    }
}

app.post('/api/reload-round', async (req, res) => {
    try {
        console.log('Request to reload round');
        let user = await authUser(req);
        if (!user) {
            res.send(INVALID_TOKEN);
            return;
        }
        if (!user.isAdmin) {
            res.send(NO_PERMS);
            return;
        }
        await saveGames();
        let round = await autoRound.reloadRound();
        res.send({
            success: true,
            currentRound: round
        });
        await createGames(round);
    } catch (err) {
        res.send(INTERNAL);
        console.error(err);
    }
});

app.post('/api/advance-round', async (req, res) => {
    try {
        console.log('Request to advance round');
        let user = await authUser(req);
        if (!user) {
            res.send(INVALID_TOKEN);
            return;
        }
        if (!user.isAdmin) {
            res.send(NO_PERMS);
            return;
        }
        await saveGames();
        let worked = await autoRound.advanceRound();
        if (worked === null) {
            res.send({
                success: false,
                errorCode: 'errNotStarted',
                errorMessage: 'You must start the tournament before attempting to advance the round'
            });
            return;
        }
        res.send({
            success: true,
            currentRound: worked
        });
        await createGames(worked);
    } catch (err) {
        res.send(INTERNAL);
        console.error(err);
    }
});

app.post('/api/set-round', async (req, res) => {
    try {
        console.log('Request to advance round');
        let user = await authUser(req);
        if (!user) {
            res.send(INVALID_TOKEN);
            return;
        }
        if (!user.isAdmin) {
            res.send(NO_PERMS);
            return;
        }
        await saveGames();
        let roundNum = req.body.roundNum;
        await autoRound.setRound(roundNum);
        console.log('Done setting round.');
        res.send({
            success: true,
            currentRound: roundNum
        });
        await createGames(roundNum);
        console.log('Done creating games');
    } catch (err) {
        res.send(INTERNAL);
        console.error(err);
    }
});

app.get('/api/list-teams', async (req, res) => {
    try {
        let user = await authUser(req);
        if (!user) {
            res.send(INVALID_TOKEN);
            return;
        }
        if (!user.isAdmin) {
            res.send(NO_PERMS);
            return;
        }
        let teams = await db.listTeams();
        teams.sort((a, b) => b.members.length - a.members.length);
        teams = teams.map(team => {
            team.members = team.members.map(userInfo);
            return team;
        });
        res.json({
            success: true,
            teams
        });
    } catch (err) {
        console.error(err);
        res.send(INTERNAL);
    }
});

app.get('/api/active-games', async (req, res) => {
    try {
        let user = await authUser(req);
        if (!user) {
            res.send(INVALID_TOKEN);
            return;
        }
        if (!user.isAdmin) {
            res.send(NO_PERMS);
            return;
        }
        let active = [];
        for (let roomId in currentGames) {
            let game = currentGames[roomId];
            let roomName = (await db.findRoomWithId(roomId)).roomName;
            //if (game.active()) {
            if (!game.finished) {
                active.push({
                    ...game.state(),
                    roomName
                });
            }
        }
        res.json({
            success: true,
            activeGames: active
        });
    } catch (err) {
        console.error(chalk.red(`Error listing active games: ${err}`));
    }
});

app.get('/api/packets/:roundNum', async (req, res) => {
    try {
        let roundNum = parseInt(req.params.roundNum);
        let tournamentInfo = await db.getTournamentInfo();
        if (tournamentInfo.currentRound !== roundNum) {
            res.status(403).end();
            return;
        }
        let user = await authUser(req);
        if (!user) {
            res.status(403).end();
            return;
        }
        let allowed = user.isAdmin;
        if (user.isMod) {
            allowed = (user.roomId !== null);
        }
        if (!allowed) {
            res.status(403).end();
            return;
        }
        res.sendFile(path.join(__dirname, 'rounds', `round${roundNum}.pdf`));
    } catch (err) {
        console.error(chalk.red(`Error getting packet: ${err}`));
    }
});

/*process.on('uncaughtException', err => {
    console.error(chalk.red(`Uncaught error: ${err}`));
    console.trace(err);
    saveGames()
        .then(() => {
            console.log('Emergency backup of games completed.');
        })
        .catch(console.error);
});*/

process.on('uncaughtException', err => {
    console.error(chalk.red(`Uncaught error: ${err}`));
    console.trace(err);
});

server.listen(8080);
