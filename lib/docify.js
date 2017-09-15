/*Handlebars.registerHelper('sectionlist', function() {
  console.log("sectionlist: ");
  console.log(this);

  return obj.sections;
});*/

var attemptSections = 65;//50;
var attemptFiles = 65;
var passedSectionAttempts = 0;

var docify = {};

render();

function render() {
  var source = $('#section-template').html();
  var template = Handlebars.compile(source);
  var data = parseContent('./content');
  docify.onDataLoad = function() {
    var cleanedSections = cleanUpData(data.sections);
    data.sections = cleanedSections;
    var html = template(data);
    $('body').append(html);
    docify.ready();
    //initializeSketches();
  }
}

function cleanUpData(data) {
  return _.map(_.compact(data), function(item) {
    item.files = _.compact(item.files);
    return item;
  });
}

function parseContent(basePath) {
  //var allContent = [];
  var allContent = {sections:[]};

  // Attempt to load the header texts
  loadText(cat(basePath, "/course.txt"), function(res) {
    allContent.course = res;
  });
  loadText(cat(basePath, "/semester.txt"), function(res) {
    allContent.semester = res;
  });
  loadText(cat(basePath, "/teacher.txt"), function(res) {
    allContent.teacher = res;
  });
  loadText(cat(basePath, "/student.txt"), function(res) {
    allContent.student = res;
  });


  _.each(numberedArray(1, attemptSections), function(i) {

    // Attempt to load the headline file of a section
    loadText(cat(basePath, "/", i, "/headline.txt"), function(headlineResponse) {
      var section = {
        title: headlineResponse,
        text: "",
        files: []
      };

      // Setup loading for sub-items
      var sketchPlaceholderArray = numberedArray(1, attemptFiles);
      var sketchesQueriedCount = 0;
      var sketchAttemptFinished = function() {
        sketchesQueriedCount++;
        if (sketchesQueriedCount == sketchPlaceholderArray.length + 1) { // +1 because we're simply counting the global description as a sketch item
          sectionAttemptFinished();
        }
      }

      // Attempt to load text file
      loadText(cat(basePath, "/", i, "/text.txt"), function(textResponse) {
        section.text = paragraphify(textResponse);
        sketchAttemptFinished();
      }, sketchAttemptFinished);

      // Attempt to load files
      _.each(sketchPlaceholderArray, function(j) {
        var fileItem = {
          url: "",
          text: "",
          isPDE: false,
          isHTML: false,
          isSVG: false
        };
        var itemsQueriedCount = 0;
        var itemAttemptFinished = function() {
          itemsQueriedCount++;
          if (itemsQueriedCount == 3) {
            sketchAttemptFinished();
          }
        }

        loadText(cat(basePath, "/", i, "/", j, ".html"), function(htmlResponse) {
          fileItem.url = cat(basePath, "/", i, "/", j, ".html");
          fileItem.isPDE = false;
          fileItem.isHTML = true;
          fileItem.isSVG = false;
          section.files[j] = fileItem;
          itemAttemptFinished();
        }, itemAttemptFinished);
        loadText(cat(basePath, "/", i, "/", j, ".htm"), function(htmlResponse) {
          fileItem.url = cat(basePath, "/", i, "/", j, ".htm");
          fileItem.isPDE = false;
          fileItem.isHTML = true;
          fileItem.isSVG = false;
          section.files[j] = fileItem;
          itemAttemptFinished();
        }, itemAttemptFinished);
        loadText(cat(basePath, "/", i, "/", j, ".pde"), function(pdeResponse) {
          fileItem.url = cat(basePath, "/", i, "/", j, ".pde");
          fileItem.isPDE = true;
          fileItem.isHTML = false;
          fileItem.isSVG = false;
          section.files[j] = fileItem;
          itemAttemptFinished();
        }, itemAttemptFinished);
        loadText(cat(basePath, "/", i, "/", j, ".jpg"), function(jpgResponse) {
          fileItem.url = cat(basePath, "/", i, "/", j, ".jpg");
          fileItem.isPDE = false;
          fileItem.isHTML = false;
          fileItem.isSVG = false;
          section.files[j] = fileItem;
          itemAttemptFinished()
        }, itemAttemptFinished);
        loadText(cat(basePath, "/", i, "/", j, ".jpeg"), function(jpgResponse) {
          fileItem.url = cat(basePath, "/", i, "/", j, ".jpeg");
          fileItem.isPDE = false;
          fileItem.isHTML = false;
          fileItem.isSVG = false;
          section.files[j] = fileItem;
          itemAttemptFinished()
        }, itemAttemptFinished);
        loadText(cat(basePath, "/", i, "/", j, ".png"), function(pngResponse) {
          fileItem.url = cat(basePath, "/", i, "/", j, ".png");
          fileItem.isPDE = false;
          fileItem.isHTML = false;
          fileItem.isSVG = false;
          section.files[j] = fileItem;
          itemAttemptFinished()
        }, itemAttemptFinished);
        loadText(cat(basePath, "/", i, "/", j, ".svg"), function(svgResponse) {
          fileItem.url = cat(basePath, "/", i, "/", j, ".svg");
          fileItem.isPDE = false;
          fileItem.isHTML = false;
          fileItem.isSVG = true;
          section.files[j] = fileItem;
          itemAttemptFinished()
        }, itemAttemptFinished);
        loadText(cat(basePath, "/", i, "/", j, ".txt"), function(itemTextResponse) {
          //itemTextResponse = paragraphify(itemTextResponse);
          fileItem.text = escapeCode(itemTextResponse);
          section.files[j] = fileItem;
          itemAttemptFinished();
        }, itemAttemptFinished);
      });

      //allContent[i] = section;
      allContent.sections[i] = section;
    }, sectionAttemptFinished);
  });
  console.log(allContent);
  return allContent;
}

function sectionAttemptFinished() {
  passedSectionAttempts++;
  checkAllAttemptsFinished();
}

function checkAllAttemptsFinished() {
  if (passedSectionAttempts == attemptFiles) {
    _.delay(docify.onDataLoad, 200);
  }
}

function loadText(path, successFunction, errorFunction) {
  $.ajax({
    url: path,
    dataType: "text",
    success: successFunction,
    error: errorFunction,
  });
}

function numberedArray(from, to) {
  var ar = [];
  for (var i = from; i <= to; i++) {
    ar.push(i)
  }
  return ar;
}

function initializeSketches() {
  var files = $('canvas');
  _.each(files, function(sketch) {
    Processing.loadSketchFromSources(sketch, [sketch.getAttribute('data-processing-sources')]);
  });
}

function escapeCode(string) {
  //console.log(string);
  var parts = string.split(/\<code\>|\<\/code\>/g);
  //console.log(parts);

  var res = "";
  for (var i = 0; i < parts.length; i++) {

    parts[i] = parts[i].replace(/^\n*/g, "");  
    if (i%2 == 0) {
      res += paragraphify(parts[i]);
    } else {
    // remove newlines at the beginning of a text block
      res += "<code>" + escapeHtml(parts[i]) + "</code>";
    }
  };

  return res;  
}


function paragraphify(str) {
  //string.replace(/\n{2,}/g, "\n");
  return cat('<p>', str.replace(/\n{3,}/g, "\n\n")                  // make sure there are no more than two newlines in a row
                       .split("\n\n").join("</p><p>"), '</p>')      // convert double newlines into <p></p> tags
                       .split("\n").join("<br>")                    // replace single newlines with <br> tags
                       .replace(/\<code\>\<br\>/g, "<code>");       // remove newlines right after opening <code> tags
}



function cat() {
  return _.reduce(arguments, function(memo, item) {
    return memo + item;
  }, "");
}


var entityMap = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': '&quot;',
  "'": '&#39;',
  "/": '&#x2F;'
};

function escapeHtml(string) {
  return String(string).replace(/[&<>"'\/]/g, function (s) {
    return entityMap[s];
  });
}


