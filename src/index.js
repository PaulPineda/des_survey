/*
* TITLE
* Description goes here
*/
import issues from './issues.js';

function DesSurveyReport(definition){
  var defaultDefinition = {
    issues: [],
    styles: {},
    container: 'des-survey',
    report_container: 'des-survey-report'
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
          report_answered:false,
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

  function setIssueState( survey_id, issue_id, new_state_object, renderFn) {
    const issues_array = getStoreSurveyByID(survey_id),
      matched_issues = issues_array.filter( ( issue ) => issue.id === issue_id );

    if( matched_issues.length < 1)
      return new Error('Cannot find issue:' + issue_id);

    const new_issue_array_state = issues_array.map( issue => {
      if ( issue.id === issue_id )
        return Object.assign( {}, issue, new_state_object );

      return issue;
    });

    storeSurveyByID( survey_id, new_issue_array_state );

    if( renderFn ) {
      renderFn( survey_id );
    } else {
      renderSurvey( survey_id );
    }
  }


  function assignHandlersToSurvey( survey_id ){
    document.body.addEventListener( 'click', function(e) {
      var issue_id = e.target.classList.value,
        target_value = e.target.value;
      if ( e.target ){
        if ( e.target.matches( 'div.des-survey-has-issue > button') ) {
          const actual_bool = $stringBoolToBool( target_value );

          if ( actual_bool ) {
            setIssueState( survey_id, issue_id, { has_issue: actual_bool, has_issue_answered: true });
          } else {
            setIssueState( survey_id, issue_id, {
              has_issue: actual_bool,
              has_issue_answered: true,
              resolved: true,
              resolved_answered: true
            });
          }

        }

        if ( e.target.matches('div.des-survey-resolve-issue > button') ) {
          setIssueState( survey_id, issue_id, {
            resolved: $stringBoolToBool(target_value),
            resolved_answered: true
          });
        }

        if ( e.target.matches('div.des-survey-submit > button') ) {
          console.log('setDataValue', getStoreSurveyByID( survey_id ));
          //window.setDataValue( getStoreSurveyByID( survey_id ) )
          createReport( survey_id );
        }

        if ( e.target.matches('span.des-report-resolve-issue > button') ) {
          setIssueState( survey_id, issue_id, {
            resolved: $stringBoolToBool(target_value),
            report_answered: true
          }, renderReport);
        }

        if ( e.target.matches('div.des-report-submit > button') ) {
          console.log('submit survery to suspend data', getStoreSurveyByID( survey_id ));
          //window.setDataValue( getStoreSurveyByID( survey_id ) );
          const resolve_buttons_nodelist = document.querySelectorAll('span.des-report-resolve-issue > button');
          resolve_buttons_nodelist.forEach(button => button.style.display = 'none');
        }

        e.target.style.display = 'none';
      }
    });
  }


  function renderSurvey( survey_id ){
    var container = document.querySelector('.'+def.container),
      dom_as_string = $surveyStateToDomString( getStoreSurveyByID ( survey_id ) );
    container.innerHTML = createStringDomTag( 'div', survey_id, dom_as_string );
  }

  function createIssueDomString(issue){
    let visibleElements = '';

    if ( issue.resolved_answered && issue.has_issue_answered ) {
      const resolved = ( issue.resolved ) ? 'resolved':'unresolved';
      visibleElements += createStringDomTag( 'div', 'des-survey-issue-text ' + resolved, issue.issue );

      return createStringDomTag( 'div', 'des-survey-issue-' + issue.id, visibleElements);
    }


    if ( issue.has_issue_answered ) {
      visibleElements +=
      createStringDomTag( 'div', 'des-survey-suggested-res', issue.suggested_res ) +
      createStringDomButtons( 'div', 'des-survey-resolve-issue', issue.id, [
        { label: 'Unresovled', value: false },
        { label: 'Resolved', value: true }
      ]);

    } else {
      visibleElements +=
        createStringDomTag( 'div', 'des-survey-issue-text', issue.issue ) +
        createStringDomTag( 'div', 'des-survey-question', issue.question ) +
        createStringDomButtons( 'div', 'des-survey-has-issue', issue.id, [
          { label: 'No', value: false },
          { label: 'Yes', value: true }
        ]);
    }

    return createStringDomTag( 'div', 'des-survey-issue-' + issue.id, visibleElements);
  }

  function createReportDomString ( issue ) {
    const resolved = ( issue.resolved ) ? 'resolved':'unresolved';
    const buttons = ( issue.report_answered || issue.resolved) ?
      ''
      :createStringDomButtons( 'span', 'des-report-resolve-issue', issue.id, [
        { label: 'Resolved', value: true }
      ]);

    let visibleElements = '';
    visibleElements += createStringDomTag(
      'div',
      'des-report-issue-text ' + resolved,
      issue.issue + buttons
    );

    return createStringDomTag( 'div', 'des-report-issue-' + issue.id, visibleElements);
  }

  function createStringDomTag( tag, container_class, inner_html ){
    return '<' + tag + ' class="' + container_class + '">' + inner_html + '</' + tag + '>';
  }

  function createStringDomButtons( tag, container_class, button_class, button_array ){
    return (
      '<' + tag + ' class="' + container_class + '">' +
        button_array.reduce( ( acc, button ) => {
          acc += (
            '<button class="' + button_class + '" value="'+ button.value + '">' +
              button.label +
            '</button>'
          );
          return acc;
        }, '') +
      '</' + tag + '>'
    );
  }

  function createReport( survey_id ) {


    renderReport( survey_id );
  }

  function renderReport( survey_id ){
    const submission = getStoreSurveyByID( survey_id );
    //const unresolved = submission.filter( issue => !issue.resolved);
    const container = document.querySelector('.'+def.report_container);
    const dom_as_string = $reportToDomString( submission );

    container.innerHTML = createStringDomTag( 'div', survey_id, dom_as_string );
  }

  // HELPER METHODS PREFIXED WITH A '$' SIGN
  function $stringBoolToBool( value ) {
    return value === 'true';
  }

  function $surveyStateToDomString( issues_array ) {
    const issues_as_dom_string = issues_array.reduce( (acc,issue) => {
      return acc += createIssueDomString(issue);
    }, '');

    let submit = '';

    if (allAnswered( issues_array )) {
      submit =  createStringDomButtons(
        'div',
        'des-survey-submit',
        null,
        [{label: 'Submit', value: ''}]
      );
    }

    return issues_as_dom_string + submit;
  }

  function $reportToDomString( report_array ) {
    const report_as_dom_string = report_array.reduce( (acc, issue) => {
      return acc += createReportDomString(issue);
    }, '');

    // show submit on the report page unliess it has been clicked
    const submit = createStringDomButtons(
      'div',
      'des-report-submit',
      null,
      [{label: 'Submit', value: ''}]
    );

    return report_as_dom_string + submit;
  }

  function allAnswered(array){
    return array.filter( issue => !(issue.has_issue_answered && issue.resolved_answered) ).length < 1;
  }

  // function allUnresolvedAnswered(array){
  //   return array.filter( issue => !(issue.report_answered && issue) ).length < 1;
  // }

  var public_api = {
    createSurvey,
    createReport
  };

  return public_api;
}

window.DesSurveyReport = DesSurveyReport({issues}).createSurvey('survey-page-0');
