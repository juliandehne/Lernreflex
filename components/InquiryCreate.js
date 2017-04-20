import React, { Component } from 'react';

import ReactNative, {
  TouchableHighlight,
  TouchableOpacity,
  ListView,
  ScrollView,
  Text,
  TextInput,
  Platform,
  View,
  Alert,
  NavigatorIOS,
  Picker,
  Button
} from 'react-native';
import KeyboardSpacer from 'react-native-keyboard-spacer';

import {
  styles,
  Router,
  lib,
  Competence,
  LearningTemplate,
  SelectList,
  User,
  Loader,
  InputScrollView,
  InquiryDAO
} from 'Lernreflex/imports';

class Inquiry extends Component {

  constructor(){
    super();
    this.state = {
      text:'',
      catchwords:["Forschungsfrage"],
      group:'',
    };
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  handleSubmit(event) {
    //alert('A name was submitted: ' + this.state.text);
    let inquiryDAO = new InquiryDAO();
    // send question to server
    inquiryDAO.save({
      operator: "unbestimmt",
      catchwords: this.state.catchwords,
      subCompetences: [],
      superCompetences: [],
      learningProjectName: "Forschungsfragen",
      research: true
    }, this.state.text);
    // route to inquiry
  }

  render(){
    return(
      <View>
      <View style={{padding: 10}}>
       <TextInput
         style={{height: 40}}
         placeholder="Eine Forschungsfrage zu fragen?"
         onChangeText={(text) => this.setState({text})}
       />
     </View>
        <Button
        title="GO!"
        onPress={this.handleSubmit}
        />
      </View>
    );
  }
}

module.exports = Inquiry;
