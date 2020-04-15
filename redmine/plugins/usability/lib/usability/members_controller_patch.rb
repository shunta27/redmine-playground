module Usability
  module MembersControllerPatch
    def self.included(base)
      base.send :include, InstanceMethods

      base.class_eval do
        skip_before_action :authorize, only: [:change_project_memberships_us]
        skip_before_action :find_model_object, only: [:change_project_memberships_us]
        skip_before_action :find_project_from_association, only: [:change_project_memberships_us]
        require_sudo_mode :change_project_memberships_us
      end
    end

    module InstanceMethods

      def change_project_memberships_us
        find_project_by_project_id
        authorize("members", "create")
        new_members = []
        edit_members = []

        if params[:membership]
          user_ids = Array.wrap(params[:membership][:user_id] || params[:membership][:user_ids])
          user_ids << nil if user_ids.empty?

          user_ids.each do |user_id|
            member = Member.where(project: @project, user_id: user_id).last
            if member.present?
              member.set_editable_role_ids(params[:membership][:role_ids] + member.role_ids)
              member.save
              edit_members << member
            else
              member = Member.new(:project => @project, :user_id => user_id)
              member.set_editable_role_ids(params[:membership][:role_ids])
              new_members << member
            end
          end
          @project.members << new_members
        end

        respond_to do |format|
          format.html { redirect_to_settings_in_projects }
          format.js {
            @members = new_members + edit_members
            @member = Member.new
          }
        end
      end

    end
  end
end