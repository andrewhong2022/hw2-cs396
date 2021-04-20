"use strict";

const resetDB = require("../config/scripts/populateDB")

const Companion = require("./schema/Companion");
const Doctor = require("./schema/Doctor");

const express = require("express");
const { forEach } = require("lodash");
const FavoriteDoctor = require("./schema/FavoriteDoctor");
const FavoriteCompanion = require("./schema/FavoriteCompanion");
const router = express.Router();


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
        Doctor.create(req.body).save()
            .then(data => {
                res.status(201).send(data);
            })
            .catch(err => {
                res.status(500).send(err);
            });
    });

router.route("/doctors/favorites")
    .get((req, res) => {
        console.log(`GET /doctors/favorites`);
        FavoriteDoctor.find({}, 'doctor')
            .then(data => {
                const ids = data.map(el => el.doctor)
                Doctor.find({'_id' :{$in : ids}})
                    .then(output => {
                        res.status(200).send(output);
                    })
                    .catch(erro => {
                        res.status(500).send(erro);
                    })
            })
            .catch(err => {
                res.status(500).send(err);
            });
    })
    .post((req, res) => {
        console.log(`POST /doctors/favorites`);
        Doctor.findById(req.body.doctor_id)
            .then(doc => {
                FavoriteDoctor.exists({ "doctor" : doc._id })
                    .then(exi => {
                        if (exi) {
                            res.status(500).send(doc);
                        } else {
                            FavoriteDoctor.create(doc._id).save()
                                .then(() => {
                                    res.status(201).send(doc);
                                })
                                .catch(erro => {
                                    res.status(500).send(erro);
                                });
                        }
                    })
            })
            .catch(err => {
                res.status(500).send(err);
            })
    });

router.route("/doctors/favorites/:id")
    .get((req, res) => {
        console.log(`GET /doctors/favorites/:id`);
        FavoriteDoctor.findOne({'doctor' : req.params.id})
            .then(fdoc => {
                if (fdoc == null) {
                    res.status(404).send();
                    return;
                }
                Doctor.findById(req.params.id)
                    .then(data => {
                        res.status(200).send(data);
                    })
                    .catch(erro => {
                        res.status(404).send(erro);
                    })
            })
            .catch(err => {
                res.status(404).send(err);
            })
    }) 
    .delete((req, res) => {
        console.log(`DELETE /doctors/favorites/:id`);
        FavoriteDoctor.findOneAndDelete({'doctor' : req.params.id})
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
                            res.status(200).send(data.every(c => c.alive == true));
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
        Companion.create(req.body).save()
            .then(data => {
                res.status(201).send(data);
            })
            .catch(err => {
                res.status(500).send(err);
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
        FavoriteCompanion.find({}, 'companion')
            .then(data => {
                const ids = data.map(el => el.companion)
                Companion.find({'_id' : {$in : ids}})
                    .then(output => {
                        res.status(200).send(output);
                    })
                    .catch(erro => {
                        res.status(500).send(erro);
                    })
            })
            .catch(err => {
                res.status(500).send(err);
            });
    })
    .post((req, res) => {
        console.log(`POST /companions/favorites`);
        Companion.findById(req.body.companion_id)
            .then(comp => {
                FavoriteCompanion.exists({ "companion" : comp._id })
                    .then(alrexists => {
                        if (alrexists) {
                            res.status(500).send(comp);
                        } else {
                            FavoriteCompanion.create(comp._id).save()
                                .then(() => {
                                    res.status(201).send(comp);
                                })
                                .catch(erro => {
                                    res.status(500).send(erro);
                                });
                        }
                    })
            })
            .catch(err => {
                res.status(500).send(err);
            })
    })

router.route("/companions/favorites/:id")
    .get((req, res) => {
        console.log(`GET /companions/favorites/:id`);
        FavoriteCompanion.findOne({'companion' : req.params.id})
            .then(fcomp => {
                if (fcomp == null) {
                    res.status(404).send();
                    return;
                }
                Companion.findById(req.params.id)
                    .then(data => {
                        res.status(200).send(data);
                    })
                    .catch(erro => {
                        res.status(404).send(erro);
                    })
            })
            .catch(err => {
                res.status(404).send(err);
            })
    }) 
    .delete((req, res) => {
        console.log(`DELETE /companions/favorites/:id`);
        FavoriteCompanion.findOneAndDelete({'companion' : req.params.id})
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
                    Companion.findById(req.params.id)
                        .then(comp => { 
                            res.status(200).send(comp); 
                        });
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
                    return;
                }
                res.status(200).send();
            })
            .catch(err => {
                res.status(404).send(err);
            });
    });

router.route("/companions/:id/doctors")
    .get((req, res) => {
        console.log(`GET /companions/${req.params.id}/doctors`);
        Companion.findById(req.params.id, 'doctors')
            .then(data => {
                Doctor.find({ '_id' : {$in : data.doctors}})
                    .then(output => {
                        res.status(200).send(output);
                    })
                    .catch(erro => {
                        res.status(204).send(erro);
                    });
            })
            .catch(err => {
                res.status(404).send(err);
            });
    });

router.route("/companions/:id/friends")
    .get((req, res) => {
        console.log(`GET /companions/${req.params.id}/friends`);
        Companion.findById(req.params.id, 'seasons')
            .then(data => {
                Companion.find({ '_id' : { $not : { $eq : req.params.id }}, 'seasons' : { $elemMatch : { $in : data.seasons }}})
                    .then(output => {
                        res.status(200).send(output);
                    })
                    .catch(erro => {
                        res.status(204).send(erro)
                    })
            }) 
            .catch(err => {
                res.status(404).send(err);
            });
    });

module.exports = router;