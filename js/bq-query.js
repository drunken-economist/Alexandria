var project_id = '1057933320749';
var client_id = '1057933320749-618njqvh0adan1jluh69gj7h7i0653at.apps.googleusercontent.com';

var config = {
  'client_id': client_id,
  'scope': 'https://www.googleapis.com/auth/bigquery'
};

var comment_data;

function runQuery() {
 var request = gapi.client.bigquery.jobs.query({
    'projectId': project_id,
    'timeoutMs': '30000',
    'query': 'SELECT * FROM [reddit_comments.example_table]'
  });
  request.execute(function(response) {     
      console.log(response)
      comment_data=JSON.stringify(response.result.rows);
    });
}

function auth() {
  gapi.auth.authorize(config, function() {
      gapi.client.load('bigquery', 'v2');
      $('#client_initiated').html('BigQuery client initiated');
  });
  $('#auth_button').hide();
}