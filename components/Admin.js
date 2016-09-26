import React, {
  Component,
} from 'react';
import {
  TouchableHighlight,
  ListView,
  TextInput,
  ScrollView,
  Text,
  View,
  NavigatorIOS,
  Platform
} from 'react-native';
import {styles, Router, User, Course, Loader} from 'Lernreflex/imports';


class Admin extends Component{

  constructor(){
    super();
    this.state = {
      loading:false,
      courseId:'',
      printableName:'',
      competences:''
    };
    this.render = this.render.bind(this);
  }

  rowPressed(rowData) {

  }

  renderRow(rowData){
    return <TouchableHighlight underlayColor={styles.list.liHeadHover} onPress={() => this.rowPressed(rowData)} style={styles.list.liHead}>
      <View>
        <View style={styles.list.rowContainer}>
          <View style={styles.list.textContainer}>
            <Text style={styles.list.headText}>
              {rowData.title}
            </Text>
          </View>
        </View>
        <View style={styles.list.separator} />
      </View>
    </TouchableHighlight>
  }

  createCourse(){
    let competences = this.state.competences.split(',');
    let course_obj = {
      courseId: this.state.courseId,
      printableName: this.state.printableName,
      competences: competences
    };
    let course = new Course();
    this.setState({loading:true});
    let _this = this;
    course.save(course_obj).then((d) => {
      alert(1);
      _this.setState({loading:false});
    });
  }

  _renderSaveCourseButton(){
    if(!this.state.loading) {
      return <TouchableHighlight underlayColor={styles._.hoverBtn} style={styles._.button} onPress={() => this.createCourse()}>
      <Text style={[styles._.buttonText, styles._.big]}>Speichern</Text>
    </TouchableHighlight>
    } else {
      return <Loader color={styles._.primary} />
    }
  }

  render(){
    let courseId = '';
    let printableName = '';
    let competences = '';
    return <ScrollView style={styles.wrapper}>
      <Text>Kurs mit Kompetenzen hinzufügen</Text>
        <TextInput
          ref="courseId"
          onChangeText={(courseId) => this.setState({courseId})}
          value={this.state.courseId}
          multiline={false}
          editable={!this.state.loading}
          style={styles.comp.input}
          returnKeyType="next"
          blurOnSubmit={false}
          placeholder="courseId">
        </TextInput>
        <TextInput
          ref="printableName"
          onChangeText={(printableName) => this.setState({printableName})}
          value={this.state.printableName}
          multiline={false}
          editable={!this.state.loading}
          style={styles.comp.input}
          returnKeyType="next"
          blurOnSubmit={false}
          placeholder="printableName">
        </TextInput>
        <TextInput
          ref="competences"
          onChangeText={(competences) => this.setState({competences})}
          value={this.state.competences}
          multiline={true}
          editable={!this.state.loading}
          style={styles.comp.input}
          returnKeyType="next"
          blurOnSubmit={false}
          placeholder="competences">
        </TextInput>
        {this._renderSaveCourseButton()}
    </ScrollView>
  }
}



module.exports = Admin;
