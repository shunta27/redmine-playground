jsToolBar.prototype.elements.cut = {
  type: 'button',
  title: 'Cut',
  fn: {
    wiki: function() {
      this.encloseLineSelection_cut('{{cut()\n', '\n}}');
    }
  }
};

jsToolBar.prototype.elements.us_color_text = {
  type: 'button',
  title: 'us_text_color',
  fn: {
    wiki: function() {
      var This = this;
      this.us_colorMenu(function(color){
        This.encloseSelection('%{color:' + color + '}', '%');
      });
    }
  }
};

jsToolBar.prototype.encloseLineSelection_cut = function(prefix, suffix, fn) {
  this.textarea.focus();

  prefix = prefix || '';
  suffix = suffix || '';

  var start, end, sel, scrollPos, subst, res;
  var charLimit = 60;

  if (typeof(document["selection"]) != "undefined") {
    sel = document.selection.createRange().text;
  } else if (typeof(this.textarea["setSelectionRange"]) != "undefined") {
    start = this.textarea.selectionStart;
    end = this.textarea.selectionEnd;
    scrollPos = this.textarea.scrollTop;
    // go to the start of the line
    start = this.textarea.value.substring(0, start).replace(/[^\r\n]*$/g,'').length;
    // go to the end of the line
          end = this.textarea.value.length - this.textarea.value.substring(end, this.textarea.value.length).replace(/^[^\r\n]*/, '').length;
    sel = this.textarea.value.substring(start, end);
  }

  if (sel.match(/ $/)) {
    sel = sel.substring(0, sel.length - 1);
    suffix = suffix + " ";
  }

  var index = prefix.indexOf('(') + 1;
  var title = (sel.length > charLimit) ? (sel.substr(0, charLimit) + '...') : sel;
  prefix = prefix.slice(0, index) + title + prefix.slice(index);

  if (typeof(fn) == 'function') {
    res = (sel) ? fn.call(this,sel) : fn('');
  } else {
    res = (sel) ? sel : '';
  }

  subst = prefix + res + suffix;

  if (typeof(document["selection"]) != "undefined") {
    document.selection.createRange().text = subst;
    var range = this.textarea.createTextRange();
    range.collapse(false);
    range.move('character', -suffix.length);
    range.select();
  } else if (typeof(this.textarea["setSelectionRange"]) != "undefined") {
    this.textarea.value = this.textarea.value.substring(0, start) + subst +
    this.textarea.value.substring(end);
    if (sel) {
      this.textarea.setSelectionRange(start + subst.length, start + subst.length);
    } else {
      this.textarea.setSelectionRange(start + prefix.length, start + prefix.length);
    }
    this.textarea.scrollTop = scrollPos;
  }
};



jsToolBar.prototype.draw_button = function(button_before, name, mode){
  this.setMode(mode);
  var b, tool, newTool;
  b = this.elements[name];

  var disabled =
      b.type == undefined || b.type == ''
      || (b.disabled != undefined && b.disabled)
      || (b.context != undefined && b.context != null && b.context != this.context);

  if (!disabled && typeof this[b.type] == 'function') {
    tool = this[b.type](name);
    if (tool) newTool = tool.draw();
    if (newTool) {
      this.toolNodes[name] = newTool;
      $(button_before).before(newTool);
      //this.toolbar.insertBefore(newTool, button_before);
    }
  }
};

jsToolBar.prototype.us_colorMenu = function(fn){
  var codeRayColor = ['#31c73b', '#7cc3c4', '#5a8eff', '#ba99ff', '#a8bcce', '#c1be00', '#f99000',
    '#ff8985', '#28a931', '#67a3a4', '#5080e7', '#a488e2', '#8e9faf', '#a19f00',
    '#db7f00', '#ff3f30', '#1d8925', '#508182', '#456ec8', '#8e75c4', '#73818e',
    '#807e00', '#bb6c00', '#f32300', '#136619', '#395e5f', '#385ca8', '#7760a4',
    '#57616c', '#5c5a00', '#9c5800', '#d51e00'];
  var menu = $("<ul class='js_toolbar_us_text_color_menu' style='position:absolute;'></ul>");
  for (var i = 0; i < codeRayColor.length; i++) {
    $("<li data-color='" + codeRayColor[i] + "' style='background-color:" + codeRayColor[i] + "; color:" + codeRayColor[i] + ";'></li>").text(codeRayColor[i]).appendTo(menu).mousedown(function(){
      fn($(this).attr('data-color'));
    });
  }
  $("body").append(menu);
  menu.menu().width(192).position({
    my: "left top",
    at: "left bottom",
    of: this.toolNodes['us_color_text']
  });
  $(document).on("mousedown", function() {
    menu.remove();
  });
  return false;
};