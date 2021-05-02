const express=require("express");
const pug = require('pug');
const levenshtein = require('js-levenshtein');
const app = express();
const timeMap = new Map();

hostname = "localhost",
    port=80,
    publicDir= __dirname;

app.set('views', publicDir)
app.set('view engine', 'pug');
var total = 0;
var keys = ["gibbs4567","dimitrescu2980","jorj0450","indec7801","except4879","astrazenecca7895","casiope4578","basil4798","havre4875","nigel7895"]
app.get("/",function(req,res){
    res.render('td9', { chiffres: total});
});

for(let clef of keys) {
    timeMap.set(clef, [0, 0]);
    app.get("/"+clef+"/distance", function (req, res) {
        var d = new Date();
        var n = d.getMinutes();
        if (timeMap.get(clef)[1] == n) {
            timeMap.set(clef, [timeMap.get(clef)[0] + 1, n]);
        } else {
            timeMap.set(clef, [0, n]);
        }
        if (timeMap.get(clef)[0] >= 5) {
            res.json({
                "utilisateur": clef,
                "erreur": "nombre de requêtes dépassé, attendez une minute"
            });
            return;
        }
        if (req.query.A == undefined || req.query.B == undefined) {
            res.json({
                "utilisateur": clef,
                "erreur": "la requête est mal formée"
            });
            return;
        }
        if (req.query.A.length > 50 || req.query.B.length > 50) {
            res.json({
                "utilisateur": clef,
                "erreur": "une des deux chaînes est trop longue (gardez des chaînes inférieures à 50)"
            });
            return;
        }
        if (/[^ACGT]/gi.test(req.query.A) || /[^ACGT]/gi.test(req.query.B)) {
            res.json({
                "utilisateur": clef,
                "erreur": "une des chaînes ne code pas de l’ADN"
            });
            return;
        }
        total += 1;
        var hrstart = process.hrtime();
        var dist = levenshtein(req.query.A, req.query.B);
        hrend = process.hrtime(hrstart);
        res.json({
            "utilisateur": clef,
            "date": "36",
            "A": req.query.A,
            "B": req.query.B,
            "distance": dist,
            "temps de calcul (ms)": ((hrend[0] * 1000) + (hrend[1] / 1000000)),
            "interrogations minutes": timeMap.get(clef)[0] + 1
        });
    });
};
app.get("/total",function(req,res) {
    res.send(total+" requêtes effectuées aujourd'hui");
});

app.use("/public", express.static(publicDir));

app.use(function(req,res){
    res.json({
        "erreur": "vous n’avez pas les autorisations pour utiliser ce service"
    });
});

app.listen(port, () => {
    console.log('Server app listening on port ' + port);
});
