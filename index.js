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
      } else {
        showError();
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
      } else {
        showError();
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

  if (!id) {
    return false;
  }

  hideComments();
  hideQuestion();

  var addData = callbacker(2, function(data) {
    console.log(data);
    showComments(data, id);
  });

  grabPost(id, function(response) {
    var qData = {
      from: response.from.name,
      message: response.message
    }

    addData({
      question: qData
    });
  
    hideHow();
    showQuestion(qData);
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
}

function showQuestion(data) {
  document.getElementById('author').innerHTML = data.from;
  document.getElementById('question-message').innerHTML = data.message;

  document.getElementById('question').style.transform = 'translateY(-417px)';
}

function hideQuestion() {
  document.getElementById('question').style.transform = 'translateY(-530px)';
}

function showHow() {
  document.getElementById('how').style.transform = 'initial';
}

function hideHow() {
  document.getElementById('how').style.transform = 'translateY(-460px)';
}

function showComments(data, id) {
  var container = document.getElementById('comments');
  // set comments div to be invisible
  container.style.visibility = 'hidden';
  // render the comments
  container.innerHTML = '';

  var downloads = document.createElement('div');
  downloads.classList.add('downloads');
  downloads.classList.add('centered');
  downloads.innerHTML = 'Download as:'

  var jsonData = 'text/json;charset=utf-8,';
  jsonData += encodeURIComponent(JSON.stringify(data));

  var jsonDL = document.createElement('a');
  jsonDL.href = 'data:' + jsonData;
  jsonDL.download = 'comments-' + id + '.json';
  jsonDL.innerHTML = 'JSON';
  downloads.appendChild(jsonDL);

  var txtData = 'text/plain;charset=utf-8,';
  txtData += encodeURIComponent(toPlaintext(data));

  var txtDL = document.createElement('a');
  txtDL.href = 'data:' + txtData;
  txtDL.download = 'comments-' + id + '.txt';
  txtDL.innerHTML = 'Plaintext';
  downloads.appendChild(txtDL);

  container.appendChild(downloads);

  if (data.comments.length == 0) {
    container.innerHTML += 'No comments';
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

  // set bottom of comments div to be above question div
  var h = container.offsetHeight;
  var offset = -(530 + h);
  container.style.transition = 'transform 0s';
  container.style.transform = 'translateY(' + offset + 'px)';
  window.setTimeout(function() {
    // make comments div visible and set translate to show them
    container.style.transition = 'transform 0.5s ease-out 0s';
    container.style.visibility = 'visible';
    container.style.transform = 'translateY(-430px)';
  }, 200);
}

function hideComments() {
  var container = document.getElementById('comments');
  var h = container.offsetHeight;
  var offset = -(530 + h);
  container.style.transition = 'transform 0.5s ease-out 0s';
  container.style.transform = 'translateY(' + offset + 'px)';
}

function toPlaintext(data) {
  var head = data.question.from + '\n' + data.question.message + '\n\n';
  return _.reduce(data.comments, function(stringSoFar, commentObj) {
    return stringSoFar + commentObj.from + '\n' + commentObj.messages.join('\n') + '\n\n';
  }, head);
}

function showError() {
  var error =  document.getElementById('error');
  error.style.transform = 'translateY(-533px)';
  window.setTimeout(function() {
    error.style.transform = 'translateY(-630px)';
  }, 1500);
}