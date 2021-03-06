"use strict";

const express = require('express');
const router  = express.Router();

module.exports = (knex) => {

  // get all users for testing
  router.get("/", (req, res) => {
    knex
      .select("*")
      .from("users")
      .then((results) => {
        res.json(results);
    }).catch(function(err) {
        console.error(err);
      });
  });

  // render user profile page
  router.get("/:user_id", (req, res) => {
    knex
      .select("first_name", "last_name")
      .from("users")
      .where("id", req.params.user_id)
      .then((results) => {
        let fname = results[0].first_name;
        let lname = results[0].last_name;
        res.render("profile", {
          fname: fname,
          lname: lname
        });
      }).catch(function(err) {
          console.error(err);
        });
  });

  // return list of user's maps
  router.get("/:user_id/maps", (req, res) => {
    knex
      .select("map_title", "id")
      .from("maps")
      .where("created_by", req.params.user_id)
      .then((results) => {
        res.json(results);
    }).catch(function(err) {
        console.error(err);
      });
  });

  // return list of maps that user has contributed to
  router.get("/:user_id/contributions", (req, res) => {
    knex("users")
      .join("points", "users.id", "points.created_by")
      .join("maps", "map_id", "maps.id")
      .distinct("map_title", "maps.id")
      .select()
      .where("points.created_by", req.params.user_id)
      .then((results) => {
        res.json(results);
    }).catch(function(err) {
        console.error(err);
      });
  });


  // return list of user's favourites
  router.get("/:user_id/favourites", (req, res) => {
    knex("users")
      .join("favourites", "users.id", "user_id")
      .join("maps", "map_id", "maps.id")
      .distinct("map_title", "maps.id")
      .select()
      .where("user_id", req.params.user_id)
      .then((results) => {
        res.json(results);
    }).catch(function(err) {
        console.error(err);
      });
  });

  // toggle existence of user/map favourite
  router.post("/favourites", (req, res) => {
    knex
      .select("*")
      .from("favourites")
      .where("user_id", req.session.user_id).andWhere("map_id", req.body.map_id)
      .then((results) => {
        if(results.length !== 0) {
          knex("favourites")
            .where({
              map_id: req.body.map_id,
              user_id: req.session.user_id
            })
            .del()
            .then(() => {
              res.send(true); // existed favourite
            });
        } else {
          knex("favourites")
            .insert({
              map_id: req.body.map_id,
              user_id: req.session.user_id
            }).then(() => {
              res.send(false); // new favourite
            });
        }
    }).catch(function(err) {
        console.error(err);
      });
  });

  return router;
}
