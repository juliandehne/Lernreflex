'use strict'
import Model from 'Lernreflex/models/Model';
import {LearningTemplate, Course, Activity, User, lib} from 'Lernreflex/imports'


class Inquiry extends Model {

  constructor(caching = true){
    super('Competence', caching);
    this.urls = {
      competences: ''
    }

    /** Scales for the self assessment */
    this.scales = {
      progress: {unit:'%', values:['0', '10', '20','30','40','50','60','70','80','90','100']},
      time: {unit:'Min', values:['0 - 10', '10 - 20', '20 - 30', '30 - 60', '60 - 120', '120 - 180', '> 180']},
      interest: {unit:'', values:['Sehr klein', 'Klein', 'Mittel', 'Groß', 'Sehr groß']}
    };

    /** Stub for a inquiry */
    this.definition = {
      operator: '*',
      forCompetence: '*',
      catchwords:['*'],
      subCompetences: ['*'],
      superCompetences: ['*'],
      learningProjectName: '*',
      research: true
    };
    this.setApi(1);
  }

  /**
  * Save a competence object to the API
  * @param obj {object} A competence object that has everything defined in the definition
  */
  save(obj){
    var key = obj.isGoal ? 'goals' : 'competences';
    obj = this.checkDefinition(obj);
    if(obj){
      let id = this.generateID(obj);
      console.log(this.lastRequest);
      this.getItem(key, {})
      .then((comps) => {comps[id] = obj; return comps;})
      .then((comps) => super.save(key, comps));
      return this.put('competences/'+(id), obj);
    }
  }

  /**
  * Return the ID of a competence object
  * @param obj {object} competence
  * @return {string}
  */
  generateID(obj){
    return obj.forCompetence;
  }

}
