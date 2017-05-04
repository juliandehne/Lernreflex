import React, { Component } from 'react';

import {
    TouchableHighlight,
    ListView,
    Platform,
    Text,
    View,
    NavigatorIOS,
    ScrollView,
    ToolbarAndroid,
    RefreshControl
} from 'react-native';

import CompetenceView from 'Lernreflex/components/CompetenceView';
import CourseView from 'Lernreflex/components/CourseView';
import ListEntryCompetence from 'Lernreflex/components/ListEntryCompetence';
import {styles, Router, User, Admin, CompetenceList, Competence, Loader, Icon} from 'Lernreflex/imports';

class Inquiry extends Component {
    constructor(){
        super();
        this.unmounting = true;
        this.Competence = new Competence(true, true);
        var ds = new ListView.DataSource({
            rowHasChanged: (r1, r2) => r1 !== r2,
            sectionHeaderHasChanged : (s1, s2) => s1 !== s2,
            getSectionData: this.getSectionData,
            getRowData: this.getRowData,
        });
        this.state = {
            dataSource: ds,
            loaded: false,
            refreshing: false,
            iconsLoaded:0
        };
        this.renderRow = this.renderRow.bind(this);
        this.renderSectionHeader = this.renderSectionHeader.bind(this);
        this.loadData = this.loadData.bind(this);
        this.afterCompetenceCreate = this.afterCompetenceCreate.bind(this);
    }

    componentWillMount() {
        let icons = [
            [Router.icons.community]
        ];
        Icon.getImageSource(Router.icons.community, 30)
            .then((source) => this.setState({ communityIcon: source, iconsLoaded: this.state.iconsLoaded+1 }));
    }

    componentDidMount(){
        this.unmounting = false;
        this.setState({dataSource:this.state.dataSource.cloneWithRowsAndSections({'loader:loader': 'loader'}, ['loader'], [['loader']])});
        this.loadData();
    }


    /**
     * Reaload competence after a new competence was created
     */
    afterCompetenceCreate(){
        this.loadData(false);
    }


    /**
     * Executed when the component receives new props
     */
    componentWillReceiveProps(){
        let competence = new Competence(true, true);
        let type = 'reloadCompetences';
        setTimeout(() => {
            competence.getItem(type, false).then((value) => {
                if(value) {
                    this.loadData(false, true);
                    competence.setItem(type, false);
                }
            })
        }, 10)
    }

    /**
     * Updates the list if the progress of competence was changed
     */
    updateChanges(){
        let comp = new Competence(true, true);
        let competences = this.state.competences;
        let _this = this;
        let promises = [];
        let counter = 0;
        comp.mayApplyLocalChanges(competences, '{}.{}.name', '-', comp.toView.bind(comp)).then((comps) => {
            if(comps){
                this.loadData(false);
            } else return;
            _this.setState({competences:comps, dataSource: _this.getDatasource(comps)});
        });
    }

    componentWillUnmount(){
        this.unmounting = true;
    }

    setState(input){
        if(!this.unmounting){
            super.setState(input);
        }
    }

    /**
     * Converts the returned data into displayable data
     */
    competencesToView(comps, notAsTree){
        var viewCompetence = {
            competence:'',
            percent: ''
        }
        var sectionIDs = [];
        var rowIDs = [];
        var dataBlob = {};

        var _this = this;
        Object.keys(comps).map((k) => {
            if(!comps[k]) return;
            if(!dataBlob[k]){
                sectionIDs.push(k);
                dataBlob[k] = {title:k, index:rowIDs.length, type:comps[k][0].inCourse ? 'course' : 'learningTemplate'};
                //console.log(comps[k]);
                rowIDs[dataBlob[k].index] = comps[k].map((c) => c.name);
            }

            comps[k].map((comp) => {
                dataBlob[k + ':' + comp.name] = comp;
            });
        });
        //console.log(dataBlob, sectionIDs, rowIDs);
        return {dataBlob, sectionIDs, rowIDs};
    }

    /**
     * Get the data formatted for the list view datasource
     */
    getDatasource(competences){
        let {dataBlob, sectionIDs, rowIDs} = this.competencesToView(competences);
        return this.state.dataSource.cloneWithRowsAndSections(dataBlob, sectionIDs, rowIDs);
    }

    /**
     * Display message if there are no competences/goals
     */
    emptyList(){
        let text = 'Du hast noch kein Forschungsfragen angelegt.';
        text += 'Du kannst diese Ansicht aktualisieren, indem du sie nach unten ziehst.'
        text += ' Lege mit dem + oben eins an' + '.';

        this.setState({
            dataSource:this.state.dataSource.cloneWithRowsAndSections({'empty:empty': {id:'empty', text:text}}, ['empty'], [['empty']]),
            loaded: true, refreshing: false
        });
    }

    /**
     * Load the data from the API
     * @param caching {bool} If the data can be fetched from cache
     * @param receivingProps {bool} If action was triggered by receiving props
     */
    loadData(caching = true, receivingProps = false){
        console.log(this.props);
        var _this = this;
        var competence = new Competence(caching, true);
        this.setState({refreshing:true});

        competence.getCompetences("goals").done((competences) => {
            console.log("competencr length is" + Object.keys(competences).length);
            if(Object.keys(competences).length){
                _this.setState({
                    dataSource: _this.getDatasource(competences),
                    loaded: true,
                    refreshing: false,
                    competences: competences
                });
            } else {
                this.emptyList();
            }
            if(!caching && !receivingProps) {
                competence.setItem('reloadCompetences', true);
            }
        });

    }

    /**
     * Executed when a competence/goal is pressed
     * @param rowData {object} Competence data
     */
    rowPressed(rowData) {
        if(rowData.type == 'competence'){
            rowData.updateChanges = this.updateChanges.bind(this);
            rowData.communityIcon = this.state.communityIcon;
            let route = {
                title: 'Lernziel',
                id: 'competence',
                rightButtonIcon: this.state.communityIcon,
                onRightButtonPress: () => {Router.route({
                    id:'users',
                    component: UserList,
                    passProps: {
                        communityIcon: this.state.communityIcon,
                        previousRoute: {...route},
                        backTo:'competence',
                        competenceData: rowData.competenceData
                    }
                }, this.props.navigator)},
                component: CompetenceView,
                passProps: {...rowData}
            };
            if(!rowData.courseId) { //Nur Community Icon anzeigen, wenn Kompetenz in Kurs
                delete route.rightButtonIcon;
                delete route.onRightButtonPress;
            }
            Router.route(route, this.props.navigator);
        } else if(rowData.type == 'course'){
        }
        return true;
    }

    /**
     * Get the data for a certain section of the list view
     * @param dataBlob {object}
     * @param sectionID {string} section ID
     */
    getSectionData(dataBlob, sectionID){
        return dataBlob[sectionID];
    }

    /**
     * Get the data for a certain row of the list view
     * @param dataBlob {object}
     * @param sectionID {string} section ID
     * @param rowID {string} row ID
     */
    getRowData(dataBlob, sectionID, rowID){
        return dataBlob[sectionID + ':' + rowID];
    }

    /**
     * Render the header of a section
     * @param rowData {object}
     * @param id {string} row ID
     */
    renderSectionHeader(rowData, id){
        if(id == 'loader') return null;
        if(id == 'empty') return null;
        let cstyle = rowData.type == 'course' ? styles.list.liHead2 : styles.list.liHead;
        return <TouchableHighlight underlayColor={styles.list.liHeadHover} onPress={() => {this.rowPressed(rowData)}} style={cstyle}>
            <View>
                <View style={styles.list.rowContainer}>
                    <View style={styles.list.textContainer}>
                        <Text style={styles.list.headText}>
                            {rowData.title + (rowData.type == 'course' ? ' (Kurs)' : '')}
                        </Text>
                        <Text style={styles.list.right}>
                            {/*rowData.percent+'%'*/}
                        </Text>
                    </View>
                </View>
                <View style={styles.list.separator} />
            </View>
        </TouchableHighlight>
    }

    /**
     * Render a competence in a list
     * @param rowData {object}
     * @return {ListEntryCompetence}
     */
    renderRow(rowData){
        console.log(rowData);
        return <ListEntryCompetence
            type='competence'
            underlayColor={styles.list.liHover}
            onPress={() => {this.rowPressed(rowData)}}
            rowData={rowData}
            style={styles.list.li} />
    }

    /**
     * Executed on pull to refresh to reload competences
     */
    _onRefresh() {
        this.loadData(false);
    }

    /**
     * Render the list of the competences/goals
     */
    render(){
        return <View style={styles.wrapper}>
            <ListView
                refreshControl={ <RefreshControl refreshing={this.state.refreshing} onRefresh={this._onRefresh.bind(this)} /> }
                style={styles._.list}
                dataSource={this.state.dataSource}
                enableEmptySections={true}
                renderRow={this.renderRow}
                renderSectionHeader={this.renderSectionHeader}>
            </ListView>
        </View>
    }

}

module.exports = Inquiry;
