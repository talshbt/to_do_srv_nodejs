  const bodyParser = require('body-parser');
  const express = require('express')
  const PORT = process.env.PORT || 5555;
  const app = express();
  const Promise = require('bluebird')

  app.use(bodyParser.urlencoded({extended: false}));
  app.use(bodyParser.json());

  var arr = [];

/*****************************************************************************/
var dbController = (function() {
          const sqlite3 = require('sqlite3').verbose();
        

    return {

       

        initDB: function() {
            let db = new sqlite3.Database("./mydb.sqlite3", (err) => { 
                if (err) { 
                    console.log('Error when creating the database', err) 
                } else { 
                    console.log('Database created!') 
                 
                  
                } 
            })
            return db;
        },
        read: function (){

                console.log("Read data from TODONOTES");
                db.all("SELECT rowid AS id, NoteMessage FROM TODONOTES", function(err, rows) {
                    rows.forEach(function (row) {
                        console.log(row.id + ": " + row.NoteMessage);
                    });


                });


              },


          initNoteTable: function (NoteMessage){
                let sqlCommand = "CREATE TABLE IF NOT EXISTS TODONOTES(id INTEGER PRIMARY KEY AUTOINCREMENT, NoteMessage TEXT)";
                db.run(sqlCommand);
                console.log("create database table TODONOTES");
          },    
        
          addNewNote: function (NoteMessage){
                db.run('INSERT INTO TODONOTES (NoteMessage) VALUES (?)', [NoteMessage]);
                console.log("Inserted new Note:",NoteMessage);
          },
          
          //this method will remove all data, and reset all id's
          truncate: function(){
            //db.run("DELETE FROM TODONOTES;UPDATE SQLITE_SEQUENCE SET SEQ=0 WHERE NAME='TODONOTES';");
            db.run("DROP TABLE TODONOTES;");
            this.initNoteTable();
            console.log("TODONOTES table truncated...");

            },

          deleteNote: function (id){
                db.run(
                  `DELETE FROM TODONOTES WHERE id = ?`,
                  [id],
                
                )
            },

            //this method will remove all data, without resetting id's
            deleteAll: function (){

                db.run(`DELETE FROM TODONOTES;`)
            },
         
            update: function(NoteMessage, id){
                const stmt = db.prepare('UPDATE TODONOTES SET NoteMessage = ? WHERE id = ?'); 
                const updates = stmt.run(NoteMessage, id);
            },
            getAll: function (){
              return db.all(`SELECT * FROM TODONOTES`)



              
              // console.log(s.arr);

              // db.close();

            },
            test: function(){
              getData();
            }
           
          
    };
    
})();


/*****************************************************************************/

/*****************************************************************************/
//pre-step init DB and create(if it is not exists from last time... create noteMSG table)


var db = dbController.initDB();
dbController.initNoteTable();
//dbController.truncate();

var serverController = (function() {

    
    app.get('/', function(req,res){
        res.send("Welcome to Invoicing App");
      });
      
      app.listen(PORT, function(){
        console.log(`App running on localhost:${PORT}`);
      });
      
      app.get("/createTable", function(req, res) {
      
        db = dbController.createTable();  
      
        res.send("createTable Succses");
      
      });
      
      app.post("/addNote", function(req, res) {
        
        let noteMSG = req.body.NoteMessage;
        dbController.addNewNote(noteMSG);
      
        console.log(noteMSG);
        
        dbController.read();
        res.send(`${noteMSG} added.`);
      
      });
      
      
      app.post("/deleteNote", function(req, res) {
        
        let test = req.body.id;
        dbController.deleteNote(test);
        console.log("---------------remove now " + test);
        dbController.read();
      
      
      });
      
      app.get("/deleteAll", function(req, res) {
        
        dbController.deleteAll();
        console.log("---------------remove all now ");
        res.send("remove all success");
        
        db = dbController.createTable();  
        dbController.read();
      
      });
      
      app.get("/truncate", function(req, res) {
        
          dbController.truncate();
          console.log("---------------truncate all now ");
          res.send("truncate all success");
          
          dbController.read();
        
        });

       
        function rowObj(id, NoteMessage) {
          this.id = id;
          this.NoteMessage = NoteMessage;
        }

        app.get("/getDb", function(req, res) {

          db = dbController.getAll();

          db.all("SELECT rowid AS id, NoteMessage FROM TODONOTES", function(err, rows) {
            arr = [];
            rows.forEach(function (row) {
              var newRow = new rowObj(row.id, row.NoteMessage);
              arr.push(newRow);
            });

            res.send(JSON.stringify(arr));
        });


        });

})();

