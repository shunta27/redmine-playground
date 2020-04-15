module Usability
  module IssuesControllerPatch
    def self.included(base)
      base.send(:include, InstanceMethods)

      base.class_eval do
        alias_method_chain :retrieve_previous_and_next_issue_ids, :usability

        before_action :us_set_flag, only: [:update, :show, :destroy]
      end
    end


    module InstanceMethods

      def retrieve_previous_and_next_issue_ids_with_usability
        unless Setting.plugin_usability['hide_next_prev_issues']
          retrieve_previous_and_next_issue_ids_without_usability
        end
      end

      def us_set_flag
        @use_static_date_in_history = Setting.plugin_usability['use_static_date_in_history']
      end
    end
  end
end