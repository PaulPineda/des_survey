/*
* TITLE
* Description goes here
*/
import issues from './issues.js';

//(function DesSurvey( exports, issues ){
  /*
   *  state will hold:
   *  - current state of issues
   */

  /*
   *  Survey will handle side effects such as:
   *  - DOM element creation and event handlers for issues
   */

  /*
   *  report will handle side effect for reporting, including but not limited to:
   *  - displaying unresolved issues as a lsit with option to resolve them
   *  - display submit button that will capture the result of the survey and submit state
   */

  // var public_api = {
  //   showSurveyIssues,
  //   showReport,
  //   submitSurvey
  // }



//   exports.DesSurvey = public_api
//})(window, isues);


// the output object:

// singleton, return an instance of itself

// singleton instance should be able to:
// - take a set of issues to use as state setState
// - render issues as issues listen
// - render issues as report lisst
// - handle  submission of indiviaul issues
// - handle submission of issues list

//window.getDataValue

//window.setDataValue

function DesSurvey(definition){
  var defaultDefinition = {
    issues: [],
    styles: {},
    container: 'des-survey'
  };

  var def = Object.assign({}, defaultDefinition, definition);
  var surveys = {};
  // render issues
  function createIssues(survey_id){
    var new_survey = storeSurveyByID( survey_id, augmentIssueState( survey_id, def.issues ) );

    assignHandlersToSurvey( survey_id, new_survey );
    renderSurvey( survey_id , objectArrayToDomString( new_survey ) );
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

  function augmentIssueState(survey_id, issues_array){
    var initialised_state = issues_array.map(function(issue, index){
      return Object.assign(
        {},
        issue,
        {
          answered: false,
          has_issue: false,
          issue_resolved: false,
          id: survey_id + '_' + index
        }
      );
    });
    return initialised_state;
  }

  function assignHandlersToSurvey( survey_id ){
    // for each issue delegate a handler to update the state
    document.body.addEventListener( 'click', function(e) {
      var issue_id = e.target.classList.value,
        target_value = e.target.value;
      if ( e.target && e.target.matches('div.des-survey-has-issue > button') )
        setIssueState( survey_id, issue_id, {
          has_issue: stringBoolToBool(target_value),
          answered: true
        });


      if ( e.target && e.target.matches('div.des-survey-resolve-issue > button') )
        setIssueState( survey_id, issue_id, {
          issue_resolved: stringBoolToBool(target_value)
        });
    });
  }
  function objectArrayToDomString(issues_array){
    var issues_as_dom_string = issues_array.reduce(function(acc,issue){
      return acc += createIssueDomString(issue);
    }, '');

    return issues_as_dom_string;
  }
  function renderSurvey( survey_id, dom_as_string ){
    var container = document.querySelector('.'+def.container),
      dom_survey_with_id = document.querySelector('.'+ survey_id);

    if( !dom_survey_with_id ){
      dom_survey_with_id = document.createElement('div');
      dom_survey_with_id.className = survey_id;
      dom_survey_with_id.innerHTML = dom_as_string;
    }

    container.appendChild(dom_survey_with_id);
  }
  function createIssueDomString(issue){
    var issue_text = '<div class="des-survey-issue-text">' + issue.issue + '</div>',
      question = '<div class="des-survey-question">' + issue.question + '</div>',
      suggested_res = '<div class="des-survey-suggested-res">' + issue.suggested_res + '</div>',
      issue_as_dom_string =
        '<div class="des-survey-issue-' + issue.id  + '">' +
          issue_text +
          question +
          createHasIssueButtonDomString(issue.id) +
          suggested_res +
          createResolveIssueButtonDomString(issue.id) +
        '</div>';
    return issue_as_dom_string;
  }

  function createHasIssueButtonDomString(issue_id){
    return (
      '<div class="des-survey-has-issue">' +
        '<button class="' + issue_id + '" value=false>No</button>' +
        '<button class="' + issue_id + '" value=true>Yes</button>' +
      '</div>'
    );
  }

  // NOT DRY - refactor to combine createHasIssueButtonDomString with createHasIssueButtonDomString
  function createResolveIssueButtonDomString(issue_id){
    return (
      '<div class="des-survey-resolve-issue">' +
        '<button class="' + issue_id + '" value=false>No</button>' +
        '<button class="' + issue_id + '" value=true>Yes</button>' +
      '</div>'
    );
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

  function stringBoolToBool( value ) {
    return value === 'true';
  }

  var public_api = {
    createIssues
  };

  return public_api;
}

window.DesSurvey = DesSurvey({issues}).createIssues('survey-page-0');
