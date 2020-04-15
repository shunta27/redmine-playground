if (typeof String.prototype.contains === 'undefined') {
  String.prototype.contains = function(substring) {
   return this.indexOf(substring) != -1;
  };
}

RMPlus.Usability = (function (my) {
  var my = my || {};
  my.custom_project_members_form = '';

  my.underlineMenusAndIcons = function () {
    $('#admin-menu ul li a, a.repository, #top-menu a, #main-menu a, a.icon, #content > .contextual:first > a').not('.no_line').each(function (index) {
      $(this).addClass('no_line');
    });
    $('a.no_line, #admin-menu a, a.repository, #top-menu a, #main-menu a').not(':has(span)').each(function(index) {
      if ($(this).html() == $(this).text()) {
        $(this).html('<span>'+$(this).html()+'</span>');
      }
    });
  };


  my.underlineTabs = function () {
    $('div.tabs ul li a').each(function(index) {
      $(this).addClass('no_line in_link');
      $(this).html('<span>'+$(this).html()+'</span>');
    });
  };

  my.show_flashes = function (message_error, message_notice) {
    $('.flash').remove();
    if (typeof message_error != 'undefined' && message_error != '') {
        $('#content').prepend('<div id="flash_error" class="flash error">' + message_error + '</div>');
        window.scrollTo(0, 0);
    }
    if (typeof message_notice != 'undefined' && message_notice != '') {
        $('#content').prepend('<div id="flash_notice" class="flash notice">' + message_notice + '</div>');
        window.scrollTo(0, 0);
    }
  };

  my.makePieCharts = function(element, options) {
    if (!element || !options) { return; }

    var $element = $(element);
    if (!$element.attr('data-piecharted')) {
      var radius = options.radius || parseInt($element.attr('data-radius'));
      var pcts = options.pcts || JSON.parse($element.attr('data-pcts'));
      var border_width = options.border_width || parseFloat($element.attr('data-border-width'));
      var font_size = options.font_size || parseFloat($element.attr('data-font-size'));
      var legend = options.legend || (pcts[0].toString() + '%');

      $element.html('<nobr><span style="font-size: ' + font_size + 'px; line-height: ' + (radius * 2) + 'px; vertical-align: top; margin-left: 5px;">&mdash; ' + legend + '</nobr>');

      Raphael(element[0], 2 * (radius + border_width), 2 * (radius + border_width)).pieChart(radius + border_width, radius + border_width, radius, pcts, border_width);
      $element.attr('data-piecharted', 'true');
    }
  };

  my.add_total_sum_to_issue_queries = function () {
    if (!RMPlus.Utils.exists('Usability.settings.totals_in_queries') || !RMPlus.Usability.settings.totals_in_queries) { return; }

    var totals = [];
    var group_totals = [];
    var $table = $('#content div.autoscroll table.list.issues:not(.lp_table)');

    var add_totals = function (element, totals) {
      if (totals.length == 0) { return; }
      var html = '';
      var td_checkbox = $('table.list.issues td.checkbox, table.list.issues th.checkbox');
      var has_data = false;
      var td_value = undefined;
      for (var sch = 0; sch < totals.length; sch ++) {
        if(sch == 0 && td_checkbox.length > 0){
          html += "<td class=\"checkbox\">&nbsp;</td>";
        } else {
          if (totals[sch] || totals[sch] == 0) {
            td_value = parseFloat(totals[sch]).toFixed(2);
            has_data = true;
          } else {
            td_value = '&nbsp;';
          }
          html += "<td>" + td_value + "</td>";
        }
      }
      if (has_data) {
        if (element[0].tagName == 'TBODY') {
          element.append('<tr><td class="us_row_divider" colspan="' + totals.length.toString() + '"></td></tr><tr>' + html + '</tr>');
        } else {
          element.after('<tr><td class="us_row_divider" colspan="' + totals.length.toString() + '"></td></tr><tr>' + html + '</tr>');
        }
      }
    };
    var done_rows = 0;
    var has_groups = false;
    var last_tr = undefined;
    var possible_classes = '.int,.float,.spent_hours,.total_estimated_hours,.estimated_hours,.total_spent_hours';
    $table.find('tbody tr').each(function () {
      var tr = $(this);
      if (tr.hasClass('group')) {
        if (done_rows > 1) {
          has_groups = true;
          if (group_totals.length == 0) { return; }
          add_totals.call(this, last_tr, group_totals);
          group_totals = [];
        }
      } else {
        tr.children().each(function (index) {
          totals[index] = totals[index] || undefined;
          group_totals[index] = group_totals[index] || undefined;

          var $this = $(this);
          if (!$this.is(possible_classes)) {
            return;
          }
          var val = $this.text().replace(' ', '');
          if (val == '' || val == 'x') { return; }
          if (isNaN(parseFloat(val)) || !isFinite(val)) {
            totals[index] = undefined;
            return;
          }
          val = parseFloat(val);

          totals[index] = (totals[index]) ? (totals[index] + val) : val;
          group_totals[index] = (group_totals[index]) ? (group_totals[index] + val) : val;
        });
      }
      done_rows++;
      last_tr = tr;
    });
    if (has_groups) { add_totals.call(this, last_tr, group_totals); }
    var $tbody = $('<tbody></tbody>');
    $table.append($tbody);
    add_totals.call(this, $tbody, totals);
  };

  image_pattern = /\.([0-9a-z]+)(?:[\?#]|$)/i;
  image_extentions = "bmp|gif|jpg|jpe|jpeg|png";

  function getFileExtention (string) {
    result = string.match(image_pattern);
    if (result != null) {
      return result[1].toLowerCase();
    }
    return null;
  };

  my.fileIsImage = function (string) {
    var extention = getFileExtention(string);
    return image_extentions.contains(extention);
  };

  my.createGallery = function (parent_element, gallery_name) {
    var image_index = 0;
    var galleryMap = [];
    $('a', $(parent_element)).each(function () {
      var $this = $(this);
      if (my.fileIsImage(this.href)) {
        if (this.href.contains('/attachments/download')) {
          var fake_gallery_item = $('<a href="' + this.href + '" class="gallery-item" style="display:none;"></a>');
          $this.after(fake_gallery_item);
          fake_gallery_item.attr('gallery-name', gallery_name);
          var path_segments = this.href.split('/');
          var id = path_segments[path_segments.indexOf('download') + 1];
          fake_gallery_item.attr('data-id', id);
          galleryMap[image_index] = this.href;
          image_index++;
          // nothing to do
        } else if (this.href.contains('/attachments')) {
          $this.addClass('gallery-thumbnail');
          var path_segments = this.href.split('/');
          var id = path_segments[path_segments.indexOf('attachments') + 1];
          $this.attr('data-id', id);
        }
      }
    });

    $(parent_element).attr('gallery-map', galleryMap);

    // create gallery if there are any images
    if (image_index > 0) {
      $('.gallery-item', $(parent_element)).magnificPopup(my.galleryPopupSettings);
    }

    // catch click on thumbnail and open gallery using href-index map
    $('.gallery-item, .gallery-thumbnail', $(parent_element)).on('click', function (event) {
      if (event.which === 2) {
        if ($(event.target).is('span')) {
          window.open(event.target.parentNode.href);
          return false;
        }
        else if ($(event.target).is('a, img')) {
          window.open(event.target.parentNode.href);
          return false;
        }
      }
      var data_id = this.getAttribute('data-id');
      var url_part = 'attachments/download/' + data_id;
      for (i = 0, len = galleryMap.length; i < len; i++) {
        // null check necessary since array is sparse
        if (galleryMap[i] != null && galleryMap[i].contains(url_part)) {
          $('.gallery-item', $(parent_element)).magnificPopup('open', i);
          return false;
        }
      }
    });
  };

  my.hide_sidebar = function (t) {
    var content = $('#content');
    var sidebar = $('#sidebar');

    content.data('margin-right', content.css('margin-right'));

    var vertical_links = sidebar.find('.us-sb-vr').clone();
    if (vertical_links.length > 0) {
      sidebar.children().not('#close_sidebar_icon').hide();
      var ul = $('<ul id="us-sb-vr-links"></ul>');
      ul.append(vertical_links.wrap('<li class="us-text-orientation" />').parent());
      sidebar.prepend(ul);
      sidebar.data('width', sidebar.width());
      sidebar.css('width', '4em');
      sidebar.prepend(t);
      content.css('margin-right', '4em');
    } else {
      sidebar.hide();
      sidebar.before(t);
      content.css('margin-right', '16px');
    }
    t.addClass('show_sidebar');
    t.removeClass('close_sidebar');

    localStorage["sidebar_closed"] = true;
  };

  my.show_sidebar = function (t) {
    var content = $('#content');
    var sidebar = $('#sidebar');
    if (sidebar.is(':visible')) {
      sidebar.find('#us-sb-vr-links').remove();
      sidebar.width(sidebar.data('width'));
      sidebar.children().show();
    } else {
      sidebar.show();
    }
    t.removeClass('show_sidebar');
    t.addClass('close_sidebar');
    content.css('margin-right', content.data('margin-right'));
    sidebar.prepend(t);
    localStorage["sidebar_closed"] = false;
  };

  my.collapse_changes_for_history = function() {
    if (RMPlus.Utils.exists('Usability.settings.collapse_changes_for_history') && RMPlus.Usability.settings.collapse_changes_for_history) {
      $('#history, #history_tabs').find('.journal:has(.details):not(.us-in-collapse) h4').after("<div class='us-collapse-wrapper'><a href='#' class='in_link icon us-collapser'><span class='collapsed'>" + RMPlus.Usability.expand_label + "</span><span class='expanded'>" + RMPlus.Usability.collapse_label + "</span></a></div>");
      $('#history, #history_tabs').find('.journal:has(.details):not(.us-in-collapse)').addClass('us-in-collapse').wrap('<div class="us-collapsible collapsed">');
    }
  };

  my.add_async_project_tab = function(name, project) {
    var url = RMPlus.Utils.relative_url_root + '/projects/' + project + '/settings/' + name;
    var link = $('#tab-' + name);
    link.attr('data-remote', 'true').attr('href', url);
    link.click(function(event) {
      if ($('#tab-content-' + name).attr('data-loaded')) {
        $(this).removeAttr('data-remote');
        return;
      }
      $('#tab-content-' + name).attr('data-loaded', 1);
    });
  };

  my.use_custom_project_members_form = function() {
    var tab_content_members =  $('#tab-content-members');
    if(tab_content_members.find('> p').length > 0){
      tab_content_members.find('> p')[0].remove();
    }
    $('#add_members_to_project').remove();
    $('.select2-dropdown').closest('.select2-container').remove();
    tab_content_members.prepend(my.custom_project_members_form);
  };

  return my;
})(RMPlus.Usability || {});

$(window).load(function () {

  // Do images magic, if magnificPopup is enabled on the page
  if ($.magnificPopup != null) {
    // let's create main gallery for issue or sd_request
    if ($('div.issue').length > 0) {
      RMPlus.Usability.createGallery($('div.issue').get(0), 'main');
      if ($('#tab-content-history').length > 0) {
        // console.log('FOR HISTORY')
        RMPlus.Usability.createGallery($('#tab-content-history').get(0), 'history');
      }
      if ($('#tab-content-comments').length > 0) {
        RMPlus.Usability.createGallery($('#tab-content-comments').get(0), 'comments');
      }
    }
  }

});

$(document).ready(function () {
  $(document.body).on('click', '.us-collapser', function() {
    $(this).closest('.us-collapsible').toggleClass('collapsed');
    return false;
  });

  $(document.body).on('mousedown', '.gallery-item', function(event) {
    if (event.which === 2) {
      return false;
    }
  });

  RMPlus.Usability.add_total_sum_to_issue_queries();


  $('#permissions fieldset').each(function () {
    var $this = $(this);
    $this.find('label').sort(function (a, b) {
      $a = $(a); $b = $(b);
      return ($a.text().toLowerCase() > $b.text().toLowerCase()) ? 1 : -1;
    }).appendTo($this);
  });

  $(document.body).on('click', 'form[data-remote="true"] input[type=submit], form[data-remote="true"] button[type=submit], a.icon-del[data-remote="true"], a.show_loader[data-remote="true"]', function () {
    jQuery(document.body).data('ajax_emmiter', jQuery(this));
  });

  $(document).ajaxStart(function () {
    obj = jQuery(document.body).data('ajax_emmiter');
    if (obj && obj.length > 0) {
      obj.after('<div class="loader" style="width:'+obj.outerWidth().toString()+'px; height: '+obj.outerHeight().toString()+'px;"></div>');
      obj.addClass('ajax_hidden_emmiter');
      obj.hide();
    }
    jQuery(document.body).removeData('ajax_emmiter');
  });

  $(document).ajaxStop(function () {
    jQuery("div.loader:empty").remove();
    jQuery('.ajax_hidden_emmiter').show();
  });

  if (RMPlus.Utils.exists('Usability.settings.show_sidebar_close_button') && RMPlus.Usability.settings.show_sidebar_close_button) {
      var close_sidebar = $('<a/>', { href: '#',
                                      id: 'close_sidebar_icon',
                                      class: 'R close_sidebar icon',
                                      click: function () {
                                        var btn = $(this);
                                        if (btn.hasClass('close_sidebar')) {
                                          RMPlus.Usability.hide_sidebar(btn);
                                        } else {
                                          RMPlus.Usability.show_sidebar(btn);
                                        }
                                      }
                          });
      $('#sidebar').prepend(close_sidebar);

      var closed = ('localStorage' in window && window['localStorage'] !== null) ? localStorage["sidebar_closed"] : false;
      if (closed === "true") {
        RMPlus.Usability.hide_sidebar($('#close_sidebar_icon'));
      }
  }

  RMPlus.Usability.collapse_changes_for_history();

  $('.splitcontentleft ul').each(function () {
    if ($(this).children().length == 0)
      $(this).remove();
  });

  if (RMPlus.Utils.exists('Usability.settings.enable_underlined_links') && RMPlus.Usability.settings.enable_underlined_links) {
    RMPlus.Usability.underlineMenusAndIcons();
    RMPlus.Usability.underlineTabs();
  }
});
