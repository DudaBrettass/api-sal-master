const express = require("express");
const { Client } = require("pg");
const cors = require("cors");
const bodyparser = require("body-parser");
const config = require("./config");

const app = express();
app.use(express.json());
app.use(cors());
app.use(bodyparser.json());

var conString = config.urlConnection;
var client = new Client(conString);
client.connect(function (err) {
  if (err) {
    return console.error("Não foi possível conectar ao banco.", err);
  }
  client.query("SELECT NOW()", (err, result) => {
    if (err) {
      return console.error("Erro ao executar a query.", err);
    }
    console.log(result.rows[0]);
  });
});

app.get("/", (req, res) => {
  console.log("Response ok.");
  res.send("Ok – Servidor disponível.");
});

app.get('/filmess', (req, res) => {
  try {
    client.query("SELECT * FROM filmess", (err, result) => {
      if (err) {
        return console.error("Erro ao executar a query de select filmess.", err);
      }
      res.send(result.rows);
      console.log("Chamou get filmess");
    });
  } catch (error) {
    console.log(error);
  }
});

app.get("/filmess/:id", (req, res) => {
  try {
    const id = parseInt(req.params.id);
    client.query(
      "SELECT * FROM filmess WHERE id = $1",
      [id],
      (err, result) => {
        if (err) {
          return console.error(
            "Erro ao executar a query de select filmess.",
            err
          );
        }
        res.send(result.rows);
        console.log("Chamou get filmess/:id");
      }
    );
  } catch (error) {
    console.log(error);
  }
});

app.get("/usuarios", (req, res) => {
  try {
    client.query("SELECT * FROM usuarios", (err, result) => {
      if (err) {
        return console.error("Erro ao executar a query de select usuarios.", err);
      }
      res.send(result.rows);
      console.log("Chamou get usuarios");
    });
  } catch (error) {
    console.log(error);
  }
});

app.post("/login", (req, res) => {
  const { email, senha } = req.body;
  // Verificar se o usuário existe
  client.query(
    "SELECT * FROM usuarios WHERE email = $1 AND senha = $2",
    [email, senha],
    (err, result) => {
      if (err) {
        return res
          .status(500)
          .json({
            success: false,
            message: "Erro ao executar a query select usuarios.",
          });
      }

      if (result.rowCount === 0) {
        return res
          .status(401)
          .json({ success: false, message: "Credenciais inválidas" });
      }

      res
        .status(200)
        .json({ success: true, message: "Login bem-sucedido" });
    }
  );
});

app.post("/register", (req, res) => {
  try {
    const { nome, email, senha } = req.body;
    client.query(
      "INSERT INTO kens (nome, email, senha) VALUES ($1, $2, $3)",
      [nome, email, senha], (err, result) => {
        if (err) {
          return res.status(500).json({ success: false, message: "Erro ao executar a query de insert usuarios." });
        }
        res.status(200).json({ success: true, message: "Registro bem-sucedido" });
      }
    );
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "Erro ao processar o registro" });
  }
});


app.listen(config.port, () =>
  console.log("Servidor funcionando na porta " + config.port)
);

module.exports = app;
