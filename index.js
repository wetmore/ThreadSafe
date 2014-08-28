function callbacker(times, callback) {
  var ct = 0;
  var obj = {};
  return function(data) {
    ct++;
    for (key in data) {
      obj[key] = data[key];
    }
    if (ct === times) {
      callback(obj);
    }
  };
};

function grabComments(id, after, prevArray, cb) {
  FB.api(
    '/' + id + '/comments',
    {
      after: after
    },
    function (response) {
      if (response && !response.error) {
        var latestArray = prevArray.concat(response.data);
        if (response.paging && response.paging.next) {
          grabComments(id, response.paging.cursors.after, latestArray, cb);
        } else {
          cb(latestArray);
        }
      }
    }
  );
}

function grabPost(id, cb) {
  FB.api(
    '/' + id,
    function (response) {
      if (response && !response.error) {
        cb(response);
      }
    }
  );
}

function collapse(commentsArray) {
  return _.reduce(commentsArray, function(arr, comment) {
    var lastComment = _.last(arr) || {};

    // same person commenting
    if (comment.from.name == lastComment.from) {
      lastComment.messages.push(comment.message);
    } else { // new person
      arr.push({
        from: comment.from.name,
        messages: [comment.message]
      });
    }
    return arr;
  }, []);
}

function getCommentsFromID() {
  var id = document.getElementById('id-entry').value;

  var addData = callbacker(2, function(data) {
    console.log(data);
    renderFromData(data);
  });
  
  grabPost(id, function(response) {
    addData({
      question: {
        from: response.from.name,
        message: response.message
      }
    });
  });

  grabComments(id, '', [], function(arr) {
    addData({
      comments: collapse(arr)
    });
  });

  return false;
}

function renderFromData(data) {
  var container = document.getElementById('comments');
  var json = {};

  container.innerHTML = '';

  document.getElementById('author').innerHTML = data.question.from;
  document.getElementById('question-message').innerHTML = data.question.message;

  if (data.comments.length == 0) {
    container.innerHTML = 'No comments';
  }

  _.each(data.comments, function(comment) {
    var commentDiv = document.createElement('div');
    commentDiv.classList.add('comment');

    var nameDiv = document.createElement('div');
    nameDiv.innerHTML = comment.from;
    nameDiv.classList.add('name');

    var commentsDiv = document.createElement('div');
    _.each(comment.messages, function(message) {
      var messageDiv = document.createElement('div');
      messageDiv.innerHTML = message;
      messageDiv.classList.add('message');
      commentsDiv.appendChild(messageDiv);
    });

    commentDiv.appendChild(nameDiv);
    commentDiv.appendChild(commentsDiv);

    container.appendChild(commentDiv);
  });
}

function showHowTo() {
  
}