'use strict'
import Model from 'Lernreflex/models/Model';
import {LearningTemplate, Course, Activity, User, lib} from 'Lernreflex/imports'

class InquiryDAO extends Model {

    constructor(caching = true) {
        super('InquiryDAO', caching);
        this.setApi(1);
    }

    save(obj, id) {

        // aha!
        this.getItem("competences", {})
            .then((comps) => {
                comps[id] = obj;
                return comps;
            })
            .then((comps) => super.save(key, comps));

        // hier geht die Logik los
        let user = new User();
        let learningTemplate = new LearningTemplate();
        return user.isLoggedIn().then((u) => {
            learningTemplate.save({
                userName: u.username,
                groupId: "university",
                selectedTemplate: "Forschungsfragen"
            }).then(() => this.put('competences/' + (id), obj))
                .then(() => this.post("users/" + u.username + "/interests/competences/" + id));
        });

        return user;
    }
}

module.exports = InquiryDAO;
