/**
 * @license
 * Copyright (c) 2014, 2021, Oracle and/or its affiliates.
 * Licensed under The Universal Permissive License (UPL), Version 1.0
 * as shown at https://oss.oracle.com/licenses/upl/
 * @ignore
 */
/*
 * Your incidents ViewModel code goes here
 */
define(['../accUtils', 'knockout', 'ojs/ojarraydataprovider', 'ojs/ojresponsiveutils', 'ojs/ojresponsiveknockoututils', 'ojs/ojknockout', 'ojs/ojcheckboxset', 'ojs/ojnavigationlist'],
 function(accUtils, ko, ArrayDataProvider, ResponsiveUtils, ResponsiveKnockoutUtils) {
    function LayoutViewModel() {
      // Below are a set of the ViewModel methods invoked by the oj-module component.
      // Please reference the oj-module jsDoc for additional information.

      /**
       * Optional ViewModel method invoked after the View is inserted into the
       * document DOM.  The application can put logic that requires the DOM being
       * attached here.
       * This method might be called multiple times - after the View is created
       * and inserted into the DOM and after the View is reconnected
       * after being disconnected.
       */
      this.connected = () => {
        accUtils.announce('Layout page loaded.', 'assertive');
        document.title = "Layout";
        // Implement further logic if needed
      };

      /**
       * Optional ViewModel method invoked after the View is disconnected from the DOM.
       */
      this.disconnected = () => {
        // Implement if needed
      };

      /**
       * Optional ViewModel method invoked after transition to the new View is complete.
       * That includes any possible animation between the old and the new View.
       */
      this.transitionCompleted = () => {
        // Implement if needed
      };

      let self = this;
      self.checkValue = ko.observableArray();
      self.dircolumn = ko.pureComputed(() => {
        return !!(typeof self.checkValue()[0] !== 'undefined' &&
        self.checkValue()[0] != null &&
        self.checkValue()[0] === 'dirColumn');
      });

      const data = [
        { name: "Bar diagram", id: "bar", icons: "oj-ux-ico-bar-chart" },
        { name: "Line diagram", id: "line", icons: "oj-ux-ico-share" },
        { name: "Pie diagram", id: "pie", icons: "oj-ux-ico-success-s" },
        { name: "Area diagram", id: "area", icons: "oj-ux-ico-chat-on" },
      ];

      self.dataProvider = new ArrayDataProvider(data, { keyAttributes: "id" });
        
      self.selectedItem = ko.observable("home");
        
      let mdQuery = ResponsiveUtils.getFrameworkQuery("md-up");

      if (mdQuery) {
        self.medium = ResponsiveKnockoutUtils.createMediaQueryObservable(mdQuery);
      }

      self.selectedItem = ko.observable('bar');
    }

    /*
     * Returns an instance of the ViewModel providing one instance of the ViewModel. If needed,
     * return a constructor for the ViewModel so that the ViewModel is constructed
     * each time the view is displayed.
     */
    return LayoutViewModel;
  }
);
