/*
* TITLE
* Description goes here
*/
import issues from './issues.js';

function DesSurvey(definition){
  var defaultDefinition = {
    issues: [],
    styles: {},
    container: 'des-survey'
  };

  var def = Object.assign({}, defaultDefinition, definition);
  var surveys = {};
  // render issues
  function createSurvey(survey_id){
    var new_survey = storeSurveyByID( survey_id, augmentIssueState( survey_id, def.issues ) );

    assignHandlersToSurvey( survey_id );
    renderSurvey( survey_id );
  }

  function augmentIssueState(survey_id, issues_array){
    var initialised_state = issues_array.map(function(issue, index){
      return Object.assign(
        {},
        issue,
        {
          has_issue: false,
          has_issue_answered: false,
          resolved: false,
          resolved_answered:false,
          id: survey_id + '_' + index
        }
      );
    });
    return initialised_state;
  }

  function getStoreSurveyByID ( survey_id ) {
    if(!surveys.hasOwnProperty( survey_id ))
      return new Error('No survey found with id: ' + survey_id);

    return surveys[survey_id];
  }

  function storeSurveyByID ( survey_id, array_of_issues ) {
    surveys[survey_id] = array_of_issues;
    return surveys[survey_id];
  }

  function setIssueState( survey_id, issue_id, new_state_object ) {
    var issues_array = getStoreSurveyByID(survey_id),
      matched_issues = issues_array.filter( ( issue ) => issue.id === issue_id );

    if( matched_issues.length < 1)
      return new Error('Cannot find issue:' + issue_id);

    const new_issue_array_state = issues_array.map( issue => {
      if ( issue.id === issue_id )
        return Object.assign( {}, issue, new_state_object );

      return issue;
    });

    storeSurveyByID( survey_id, new_issue_array_state );
  }


  function assignHandlersToSurvey( survey_id ){
    document.body.addEventListener( 'click', function(e) {
      var issue_id = e.target.classList.value,
        target_value = e.target.value;
      if ( e.target && e.target.matches('div.des-survey-has-issue > button') ) {
        const actual_bool = $stringBoolToBool(target_value);
        if (actual_bool )
          setIssueState( survey_id, issue_id, { has_issue: actual_bool, has_issue_answered: true });
        else
          setIssueState( survey_id, issue_id, {
            has_issue: actual_bool,
            has_issue_answered: true,
            resolved: true,
            resolved_answered: true
          });

        renderSurvey( survey_id );
      }



      if ( e.target && e.target.matches('div.des-survey-resolve-issue > button') ) {
        setIssueState( survey_id, issue_id, {
          resolved: $stringBoolToBool(target_value),
          resolved_answered: true
        });
        renderSurvey( survey_id );
      }

    });
  }


  function renderSurvey( survey_id ){
    var container = document.querySelector('.'+def.container),
      dom_as_string = $objectArrayToDomString( getStoreSurveyByID ( survey_id ) );
    container.innerHTML = createDivTextDomString(survey_id, dom_as_string);
  }

  function createIssueDomString(issue){
    let visibleElements = '';

    if ( issue.resolved_answered && issue.has_issue_answered ) {
      const resolved = ( issue.resolved ) ? 'resolved':'unresolved';
      visibleElements += createDivTextDomString( 'des-survey-issue-text ' + resolved, issue.issue );
      
      return createDivTextDomString( 'des-survey-issue-' + issue.id, visibleElements);
    }


    if ( issue.has_issue_answered ) {
      visibleElements +=
      createDivTextDomString( 'des-survey-suggested-res', issue.suggested_res ) +
      createButtonDomString( 'des-survey-resolve-issue', issue.id, [
        { label: 'Unresovled', value: false },
        { label: 'Resolved', value: true }
      ]);

    } else {
      visibleElements +=
        createDivTextDomString( 'des-survey-issue-text', issue.issue ) +
        createDivTextDomString( 'des-survey-question', issue.question ) +
        createButtonDomString( 'des-survey-has-issue', issue.id, [
          { label: 'No', value: false },
          { label: 'Yes', value: true }
        ]);
    }

    return createDivTextDomString( 'des-survey-issue-' + issue.id, visibleElements);
  }

  function createDivTextDomString( container_class, inner_html ){
    return '<div class="' + container_class + '">' + inner_html + '</div>';
  }

  function createButtonDomString( container_class, button_class, button_array ){
    return (
      '<div class="' + container_class + '">' +
        button_array.reduce( ( acc, button ) => {
          acc += (
            '<button class="' + button_class + '" value="'+ button.value + '">' +
              button.label +
            '</button>'
          );
          return acc;
        }, '') +
      '</div>'
    );
  }


  // HELPER METHODS PREFIXED WITH A '$' SIGN
  function $stringBoolToBool( value ) {
    return value === 'true';
  }

  function $objectArrayToDomString(issues_array){
    var issues_as_dom_string = issues_array.reduce(function(acc,issue){
      return acc += createIssueDomString(issue);
    }, '');

    return issues_as_dom_string;
  }

  var public_api = {
    createSurvey
  };

  return public_api;
}

window.DesSurvey = DesSurvey({issues}).createSurvey('survey-page-0');
