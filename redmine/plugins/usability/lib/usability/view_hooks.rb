module Usability
  class Hooks < Redmine::Hook::ViewListener
    render_on(:view_layouts_base_html_head, partial: 'hooks/usability/html_head')
    render_on(:view_layouts_base_body_bottom, partial: 'hooks/usability/body_bottom')
    render_on(:view_custom_fields_form_upper_box, partial: 'hooks/usability/view_custom_fields_form_upper_box')
    render_on(:us_view_projects_settings_members_bottom, partial: 'hooks/usability/us_view_projects_settings_members_bottom')
  end
end
