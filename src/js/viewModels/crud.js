/**
 * @license
 * Copyright (c) 2014, 2021, Oracle and/or its affiliates.
 * Licensed under The Universal Permissive License (UPL), Version 1.0
 * as shown at https://oss.oracle.com/licenses/upl/
 * @ignore
 */
/*
 * Your crud ViewModel code goes here
 */
define([
  '../accUtils',
  'knockout',
  'text!./departmentData.json',
  'ojs/ojarraydataprovider',
  'ojs/ojbufferingdataprovider',
  'ojs/ojconverter-number',
  'ojs/ojknockout',
  'ojs/ojinputtext',
  'ojs/ojinputnumber',
  'ojs/ojlabel',
  'ojs/ojvalidationgroup',
  'ojs/ojformlayout',
  'ojs/ojtoolbar',
  'ojs/ojmessages',
  'ojs/ojtable'
],
 function(accUtils, ko, departmentDataJson, ArrayDataProvider, BufferingDataProvider, NumberConverter) {
    function CRUDViewModel() {
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
        accUtils.announce('CRUD page loaded.', 'assertive');
        document.title = "CRUD";
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
      
      self.deptArray = JSON.parse(departmentDataJson);
      self.deptObservableArray = ko.observableArray(self.deptArray);
      
      self.dataprovider = new BufferingDataProvider(new ArrayDataProvider(self.deptObservableArray, {
          keyAttributes: "DepartmentId",
      }));
      
      self.converter = new NumberConverter.IntlNumberConverter({
          useGrouping: false,
      });

      self.isEmptyTable = ko.observable(false);
      self.messageArray = ko.observableArray();
      self.groupValid = ko.observable();
      self.inputDepartmentId = ko.observable();
      self.inputDepartmentName = ko.observable();
      self.inputLocationId = ko.observable();
      self.inputManagerId = ko.observable();
      self.firstSelected = ko.observable();
      self.disableSubmit = ko.observable(true);
      
      self.disableCreate = ko.computed(() => {
          return !self.inputDepartmentId() || self.groupValid() === "invalidShown";
      });
      
      self.disableRemoveUpdate = ko.computed(() => {
          const firstSelected = self.firstSelected();
          return (!firstSelected ||
              !firstSelected.key ||
              self.groupValid() === "invalidShown");
      });
      
      self.addRow = () => {
          if (self.groupValid() !== "invalidShown") {
              const dept = {
                  DepartmentId: self.inputDepartmentId(),
                  DepartmentName: self.inputDepartmentName(),
                  LocationId: self.inputLocationId(),
                  ManagerId: self.inputManagerId(),
              };
              self.dataprovider.addItem({
                  metadata: { key: dept.DepartmentId },
                  data: dept,
              });
          }
      };
      
      self.updateRow = () => {
          if (self.groupValid() !== "invalidShown") {
              const element = document.getElementById("table");
              const currentRow = element.currentRow;
              if (currentRow != null) {
                  const key = self.inputDepartmentId();
                  const newData = {
                      DepartmentId: self.inputDepartmentId(),
                      DepartmentName: self.inputDepartmentName(),
                      LocationId: self.inputLocationId(),
                      ManagerId: self.inputManagerId(),
                  };
                  self.dataprovider.updateItem({ metadata: { key: key }, data: newData });
              }
          }
      };
              
      self.removeRow = () => {
          const element = document.getElementById("table");
          const currentRow = element.currentRow;
          if (currentRow != null) {
              const dataObj = element.getDataForVisibleRow(currentRow.rowIndex);
              self.dataprovider.removeItem({
                  metadata: { key: dataObj.key },
                  data: dataObj.data,
              });
              self.dataprovider.getTotalSize().then(function (value) {
                  if (value == 0) {
                      self.isEmptyTable(true);
                  }
              }.bind(self));
              
              element.selected = { row: new ojkeyset_1.KeySetImpl(), column: new ojkeyset_1.KeySetImpl() };
          }
      };

      self.removeAllRow = () => {
          self.dataprovider.fetchByOffset({ size: -1, offset: 0 }).then(function (fetchResults) {
              let dataArray = fetchResults.results;
              for (let i = 0; i < dataArray.length; i++) {
                  self.dataprovider.removeItem(dataArray[i]);
              }
              self.dataprovider.getTotalSize().then(function (value) {
                  if (value == 0) {
                      self.isEmptyTable(true);
                  }
              }.bind(self));
          }.bind(self));
      };
              
      self.resetRows = () => {
          self.dataprovider.resetAllUnsubmittedItems();
          self.isEmptyTable(self.dataprovider.isEmpty() === "yes");
          self.messageArray([
              {
                  severity: "confirmation",
                  summary: "Changes have been reset.",
                  autoTimeout: 4000,
              },
          ]);
      };

      self.findIndex = (key) => {
          const ar = self.deptObservableArray();
          for (let idx = 0; idx < self.deptObservableArray().length; idx++) {
              if (ar[idx].DepartmentId === key) {
                  return idx;
              }
          }
          return -1;
      };

      self.commitOneRow = (editItem) => {
          const idx = self.findIndex(editItem.item.metadata.key);
          let error;
          if (idx > -1) {
              if (editItem.operation === "update") {
                  self.deptObservableArray.splice(idx, 1, editItem.item.data);
              }
              else if (editItem.operation === "remove") {
                  self.deptObservableArray.splice(idx, 1);
              }
              else {
                  error = {
                      severity: "error",
                      summary: "add error",
                      detail: "Row with same key already exists",
                  };
              }
          }
          else {
              if (editItem.operation === "add") {
                  self.deptObservableArray.splice(self.deptObservableArray().length, 0, editItem.item.data);
              }
              else {
                  error = {
                      severity: "error",
                      summary: editItem.operation + " error",
                      detail: "Row for key cannot be found",
                  };
              }
          }
          if (error) {
              return Promise.reject(error);
          }
          return Promise.resolve();
      };
              
      self.submitRows = () => {
          self.disableSubmit(true);
          const editItems = self.dataprovider.getSubmittableItems();
          editItems.forEach((editItem) => {
              self.dataprovider.setItemStatus(editItem, "submitting");
              self.commitOneRow(editItem)
                  .then(() => {
                  self.dataprovider.setItemStatus(editItem, "submitted");
              })
                  .catch((error) => {
                  self.dataprovider.setItemStatus(editItem, "unsubmitted", error);
                  var errorMsg = {
                      severity: error.severity,
                      summary: error.summary,
                      autoTimeout: 4000,
                  };
                  self.messageArray.push(errorMsg);
              });
          });
          self.messageArray([
              {
                  severity: "confirmation",
                  summary: "Changes have been submitted.",
                  autoTimeout: 4000,
              },
          ]);
      };
              
      self.showSubmittableItems = (submittable) => {
          const textarea = document.getElementById("bufferContent");
          let textValue = "";
          submittable.forEach((editItem) => {
              textValue += editItem.operation + " ";
              textValue += editItem.item.metadata.key + ": ";
              textValue += JSON.stringify(editItem.item.data);
              if (editItem.item.metadata.message) {
                  textValue +=
                      " error: " + JSON.stringify(editItem.item.metadata.message);
              }
              textValue += "\n";
          });
          textarea.value = textValue;
      };
              
      self.firstSelectedRowChangedListener = (event) => {
          const itemContext = event.detail.value;
          if (itemContext && itemContext.data) {
              const dept = itemContext.data;
              self.inputDepartmentId(dept.DepartmentId);
              self.inputDepartmentName(dept.DepartmentName);
              self.inputLocationId(dept.LocationId);
              self.inputManagerId(dept.ManagerId);
          }
      };

      self.hideTable = (hide) => {
          const table = document.getElementById("table");
          const noDataDiv = document.getElementById("noDataDiv");
          if (hide === true) {
              table.classList.add("oj-sm-hide");
              noDataDiv.classList.remove("oj-sm-hide");
          }
          else {
              table.classList.remove("oj-sm-hide");
              noDataDiv.classList.add("oj-sm-hide");
          }
      };

      self.dataprovider.addEventListener("submittableChange", (event) => {
          const submittable = event.detail;
          self.disableSubmit(submittable.length === 0);
          self.showSubmittableItems(submittable);
      });

      self.dataprovider.addEventListener("mutate", (event) => {
          if (self.isEmptyTable() === true && event.detail.add != null) {
              self.isEmptyTable(false);
          }
      });

      self.isEmptyTable.subscribe((newValue) => {
          self.hideTable(newValue);
      });

      self.isEmptyTable(self.dataprovider.isEmpty() === "yes");
    }

    /*
     * Returns an instance of the ViewModel providing one instance of the ViewModel. If needed,
     * return a constructor for the ViewModel so that the ViewModel is constructed
     * each time the view is displayed.
     */
    return CRUDViewModel;
  }
);
