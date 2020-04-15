module Usability
  module ProjectsControllerPatch
    def self.included(base)
      base.send :include, InstanceMethods
      base.send :include, ProjectsHelper

      base.class_eval do
        include ActionView::Helpers::FormOptionsHelper
        skip_before_action :authorize, only: [:not_member_principal]
        alias_method_chain :settings, :usability
      end
    end

    module InstanceMethods
      def settings_with_usability
        @us_add_async_tabs = Setting.plugin_usability['enable_ajax_project_settings']

        if request.get? && request.xhr? && params[:tab].present?
          @us_async_tab = project_settings_tabs_without_usability.find { |it| it[:name] == params[:tab] }
        end
        settings_without_usability
      end

      def not_member_principal
        if User.current.admin? || User.current.allowed_to?(:manage_members, @project)
          principals  = []
          if params[:q].blank?
            principals  = Principal.active.sorted.not_member_of(@project).visible.limit(100)
          else
            principals  = Principal.active.sorted.not_member_of(@project).visible.like(params[:q]).limit(100)
          end
          render json: principals .map { |p| {id: p.id, text: p.name} }
        else
          render_403
        end
      end
    end
  end
end