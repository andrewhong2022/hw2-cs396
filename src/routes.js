"use strict";

const resetDB = require("../config/scripts/populateDB")

const Companion = require("./schema/Companion");
const Doctor = require("./schema/Doctor");

const express = require("express");
const router = express.Router();

const fDoctor = []
const fCompanion = []


// completely resets your database.
// really bad idea irl, but useful for testing
router.route("/reset")
    .get((_req, res) => {
        resetDB(() => {
            res.status(200).send({
                message: "Data has been reset."
            });
        });
    });

router.route("/")
    .get((_req, res) => {
        console.log("GET /");
        res.status(200).send({
            data: "App is running."
        });
    });
    
// ---------------------------------------------------
// Edit below this line
// ---------------------------------------------------
router.route("/doctors")
    .get((req, res) => {
        console.log("GET /doctors");

        // already implemented:
        Doctor.find({})
            .then(data => {
                res.status(200).send(data);
            })
            .catch(err => {
                res.status(500).send(err);
            });
    })
    .post((req, res) => {
        console.log("POST /doctors");
        newDoctor = new Doctor(req.body).create()
            .then(data => {
                res.status(201).send(data);
            })
            .catch(err => {
                res.status(400).send();
            });
    });

router.route("/doctors/favorites")
    .get((req, res) => {
        console.log(`GET /doctors/favorites`);
        if (fDoctor.length == 0) {
            res.status(204).send(fDoctor);
        } else {
            Doctor.find({ '_id' : { $in : fDoctor }})
                .then(data => {
                    res.status(200).send(data);
                })
                .catch(err => {
                    res.status(500).send(err);
                })
        }
    })
    .post((req, res) => {
        console.log(`POST /doctors/favorites`);
        Doctor.findById(req.body.id)
            .then(doc => {
                if (doc == null) {
                    res.status(404).send();
                } else {
                    fDoctor.push(req.body.id);
                    res.status(200).send(doc);
                }
            })
            .catch(err => {
                res.status(404).send(err);
            })
    });

router.route("/doctors/favorites/:id")
    .delete((req, res) => {
        console.log(`DELETE /doctors/favorites/:id`);
        var i = fDoctor.findIndex(e => e == req.params.id);
        if (i == -1) {
            res.status(404).send();
        } else {
            fDoctor.splice(i, 1);
            res.status(200).send();
        }
    });
    
router.route("/doctors/:id")
    .get((req, res) => {
        console.log(`GET /doctors/${req.params.id}`);
        Doctor.findById(req.params.id)
            .then(data => {
                if (data == null) { 
                    res.status(404).send(); 
                    return;
                }
                res.status(200).send(data);
            })
            .catch(err => {
                res.status(404).send(err);
            });
    })
    .patch((req, res) => {
        console.log(`PATCH /doctors/${req.params.id}`);
        Doctor.findByIdAndUpdate(req.params.id, req.body)
            .then(doc => {
                if (doc == null) {
                    res.status(404).send();
                    return;
                }
                Doctor.findById(req.params.id)
                    .then(data => { 
                        res.status(200).send(data); 
                    });
            })
            .catch(err => {
                res.status(404).send(err);
            });
    })
    .delete((req, res) => {
        console.log(`DELETE /doctors/${req.params.id}`);
        Doctor.findByIdAndDelete(req.params.id)
            .then(data => {
                if (data == null) {
                    res.status(404).send();
                    return;
                }
                res.status(200).send();
            })
            .catch(err => {
                res.status(404).send(err);
            });
    });
    
router.route("/doctors/:id/companions")
    .get((req, res) => {
        console.log(`GET /doctors/${req.params.id}/companions`);
        Doctor.findById(req.params.id)
            .then(doc => {
                if (doc == null) {
                    res.status(404).send();
                    return;
                }
                Companion.find({'doctors' : {$in : req.params.id}})
                    .then(data => {
                        if (data == null) {
                            res.status(204).send(`Doctor ${req.params.id} has no companions.`);
                            return;
                        }
                        res.status(200).send(data);
                    })
            })
            .catch(err => {
                res.status(404).send(err);
                return;
            });
    });
    
router.route("/doctors/:id/companions/longest")
    .get((req, res) => {
        console.log("GET /doctors/:id/companions/longest");
        res.status(501).send();
    });

router.route("/doctors/:id/goodparent")
    .get((req, res) => {
        console.log("GET /doctors/:id/goodparent");
        Doctor.findById(req.params.id)
            .then(doc => {
                if (doc == null) {
                    res.status(404).send();
                    return;
                }
                Companion.find({'doctors' : {$in : req.params.id}}, 'alive')
                    .then(data => {
                        if (data == null) {
                            res.status(204).send();
                        } else {
                            res.status(200).send(data.every(c => c === true));
                        }
                    })
            })
            .catch(err => {
                res.status(404).send(err);
            });
    });

router.route("/companions")
    .get((req, res) => {
        console.log("GET /companions");
        // already implemented:
        Companion.find({})
            .then(data => {
                res.status(200).send(data);
            })
            .catch(err => {
                res.status(500).send(err);
            });
    })
    .post((req, res) => {
        console.log("POST /companions");
        newComp = new Companion(req.body).create()
            .then(data => {
                res.status(201).send(data);
            })
            .catch(err => {
                res.status(400).send();
            });
    });

router.route("/companions/crossover")
    .get((req, res) => {
        console.log(`GET /companions/crossover`);
        Companion.find({ 'doctors.1' : { '$exists' : true}})
            .then(data => {
                if (data == null) {
                    res.status(404).send();
                } else {
                    res.status(200).send(data);
                }
            })
            .catch(err => {
                res.status(204).send(err);
            });
    });

router.route("/companions/favorites")
    .get((req, res) => {
        console.log(`GET /companions/favorites`);
        if (length(fCompanion) == 0) {
            res.status(204).send(fDoctor);
        } else {
            Companion.find({ '_id' : { $in : fCompanion }})
                .then(data => {
                    res.status(200).send(data);
                })
                .catch(err => {
                    res.status(500).send(err);
                })
        }
    })
    .post((req, res) => {
        console.log(`POST /companions/favorites`);
        Companion.findById(req.body.id)
            .then(comp => {
                if (comp == null) {
                    res.status(404).send();
                } else {
                    fCompanion.push(req.body.id);
                    res.status(200).send(comp);
                }
            })
            .catch(err => {
                res.status(404).send(err);
            })
    })

router.route("/companions/favorites/:id")
    .delete((req, res) => {
        console.log(`DELETE /companions/favorites/:id`);
        var i = fCompanion.findIndex(e => e == req.params.id);
        if (i == -1) {
            res.status(404).send();
        } else {
            fCompanion.splice(i, 1);
            res.status(200).send();
        }
    });

router.route("/companions/:id")
    .get((req, res) => {
        console.log(`GET /companions/${req.params.id}`);
        Companion.findById(req.params.id)
            .then(data => {
                if (data == null) {
                    res.status(404).send();
                } else {
                    res.status(200).send(data);
                }
            })
            .catch(err => {
                res.status(404).send(err);
            });
    })
    .patch((req, res) => {
        console.log(`PATCH /companions/${req.params.id}`);
        Companion.findByIdAndUpdate(req.params.id, req.body)
            .then(data => {
                if (data == null) {
                    res.status(404).send();
                } else {
                    res.status(200).send(data);
                }
            })
            .catch(err => {
                res.status(404).send(err);
            });
    })
    .delete((req, res) => {
        console.log(`DELETE /companions/${req.params.id}`);
        Companion.findByIdAndDelete(req.params.id)
            .then(data => {
                if (data == null) {
                    res.status(404).send();
                } else {
                    res.status(200).send();
                }
            })
            .catch(err => {
                res.status(500).send();
            });
    });

router.route("/companions/:id/doctors")
    .get((req, res) => {
        console.log(`GET /companions/${req.params.id}/doctors`);
        Companion.findById(req.params.id, 'doctors')
            .then(data => {
                if (data == null) {
                    res.status(404).send();
                } else {
                    Doctors.find({ '_id' : {$in : data}})
                        .then(output => {
                            res.status(200).send(output);
                        })
                        .catch(err => {
                            res.status(204).send();
                        });
                }
            })
            .catch(err => {
                res.status(404).send(err);
            })
    });

router.route("/companions/:id/friends")
    .get((req, res) => {
        console.log(`GET /companions/${req.params.id}/friends`);
        Companion.findById(req.params.id, 'seasons')
            .then(data => {
                if (data == null) {
                    res.status(404).send();
                } else {
                    Companion.find({ '_id' : { $not : req.params.id }, 'seasons' : { $elemMatch: { $in : data }}})
                        .then(output => {
                            res.status(200).send(output);
                        })
                        .catch(erro => {
                            res.status(204).send(`Companion ${req.params.id} has no friends.`)
                        })
                }
            }) 
            .catch(err => {
                res.status(404).send();
            });
    });

//////////////////
// EXTRA CREDIT //
//////////////////
// copied above

module.exports = router;