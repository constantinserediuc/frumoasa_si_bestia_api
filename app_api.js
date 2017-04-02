var mysql      = require('mysql');
var express    = require('express');        
var app        = express();                 
var bodyParser = require('body-parser');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
var port = process.env.PORT || 3000;

var connection = mysql.createConnection({
  host     : 'localhost',
  user     : 'root',
  password : 'constantin',
  database : 'hack'
});



var router = express.Router();

router.post('/login', function(req, res) {
    var body = req.body;
    if(!('name' in body) || !('pass' in body)) {
        res.sendStatus(400);
    }
    var q = "select * from users where name = '" + req.body.name + "' and pass='" + req.body.pass +"'";
    console.log(q); 
    connection.query(q, function(err, rows, fields) {
        if (!err){
            if(rows.length == 0) {
                res.sendStatus(401);
            } else {
                res.json(rows[0]);
            }   
        }
        else{
            res.sendStatus(500);
            console.log("error login", err);
        }

    });
    
});

router.route('/profs')
    .get(function(req, res) {
        var profs = [];
        var q = "select id, name from users where function = 2";
        connection.query(q, function(err, rows, fields) {
            if (!err){
                res.json(rows);
            }
            else
                res.sendStatus(500);
                console.log("error /profs get", err);
        });

    });



router.route('/profs/:id/students')
    .get(function(req, res) {
        var id = req.params.id;

        var profs = [];
        var materie = {};
        var id_materie = 100;
        var q = "select id_materie from profs where id_prof = '"+ id +"'";
        connection.query(q, function(err, rows, fields) {
            if (!err){
                id_materie = rows[0].id_materie;
                var q = "select * from materii where id_materie = "+ id_materie;
                console.log(q);
                connection.query(q, function(err, rows, fields) {
                    if (!err){
                        materie = rows[0];
                        var q = "select * from link_student_materie where id_materie = "+ id_materie;
                        console.log(q);
                        connection.query(q, function(err, rows, fields) {
                            if (!err){
                                materie['students'] = rows;
                                res.json(materie);

                            }
                            else
                                res.sendStatus(500);
                                console.log("error /profs get", err);
                        });
                    }
                    else
                        res.sendStatus(500);
                        console.log("error /profs get", err);
                });
            }
            else
                res.sendStatus(500);
                console.log("error /profs get", err);
        });

        
    });


router.route('/students/:id_student/materie/:id_materie')
    .get(function(req, res) {
        var id_student = req.params.id_student;
        var id_materie = req.params.id_materie
        console.log("id_student get", id_student);
        var materie = {};
        console.log("id materie", id_materie);

        var q = "select nota from note where id_materie = '"+ id_materie +"' and id_student = '"+ id_student +"'";
        connection.query(q, function(err, rows, fields) {
            if (!err){
                console.log("materieeee", rows)
                note = []
                for (var i=0; i<rows.length; i++)
                    { note.push(rows[i]["nota"])}
                res.json(note);
            }
            else
                {res.sendStatus(500);
                console.log("error /profs get", err);}
        });

        
    });

router.route('/orar/:id_materie')
    .get(function(req, res) {
        var id_materie = req.params.id_materie
        var materie = {};
        console.log("id materie", id_materie);
        var data_curenta = new Date();
        var ora_curenta = data_curenta.getHours();
        var zi_curenta = data_curenta.getDay();
        console.log("ora curenta", ora_curenta);
        console.log("zi curenta", zi_curenta);

        var q = "select * from materie where id_materie = '"+ id_materie +"' and zi='"+zi_curenta+"' and ora > '"+ora_curenta +"' order by ora asc limit 1 ";
        console.log("aiiiiiciiii", q)
        connection.query(q, function(err, rows, fields) {
            if (!err){
                console.log("materieeee", rows)
                note = []
              //  for (var i=0; i<rows.length; i++)
                //    { note.push(rows[i]["nota"])}
                res.json(rows[0]);
            }
            else
                {res.sendStatus(500);
                console.log("error /profs get", err);}
        });

        
    });

router.route('/orar/student/:id_student')
    .get(function(req, res) {
      
        var id_student=req.params.id_student;
        var materie = {};
        console.log("id materie", id_student);
        var data_curenta = new Date();
        var ora_curenta = data_curenta.getHours();
        var zi_curenta = data_curenta.getDay();
        console.log("ora curenta", ora_curenta);
        console.log("zi curenta", zi_curenta);

        var q = "select * from materie where id_materie in (select id_materie from link_student_materie where id_student = '"+id_student+"') and zi='"+zi_curenta+"' and ora > '"+ora_curenta +"' order by ora asc limit 1 ";
        console.log("aiiiiiciiii", q)
        connection.query(q, function(err, rows, fields) {
            if (!err){
                console.log("materieeee", rows)
                note = []

                if(rows.length > 0){
                    delete rows[0].notite;
                    res.json(rows[0]);
                } else {
                    res.json({});
                }
            }
            else
                {res.sendStatus(500);
                console.log("error /profs get", err);}
        });

        
    });








app.use('/api', router);


app.listen(port);
console.log('Port:  ' + port);
