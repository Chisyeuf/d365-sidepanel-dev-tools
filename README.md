
Dynamics 365 SidePanel Tools
============================

## Summary

- [Introduction](#introduction)
- [Available Tools](#available-tools)
    - [Main Menu](#main-menu)
    - [Form Tools](#1-form-tools)
    - [Update Records](#2-update-records)
- [Contribution](#contribution)
- [Licence](#licence)

# Introduction

The Dynamics 365 SidePanel Tools extension provides a powerful suite of utilities that can enhance your productivity. This chromium extension adds a panel to the right side of Dynamics 365 pages, giving you easy access to a variety of tools that can display useful informations or edit data. These tools are designed to be user-friendly and can be opened independently.

![image](screenshots/jpg/0.OverallView.jpg)

# Available Tools


## Main Menu
<img align="right" src="screenshots/jpg/0.MainMenu.jpg">

The main menu can be opened or closed by clicking on the magic wand. The displayed button are used to open the corresponding tools describes below.

<img height="550px" width="10px">



## 1\. Form Tools
<img align="right" src="screenshots/jpg/1.FormTools.jpg">

This tool provide functionnalities used on records form. Each button are reversible : it can be activated or deactivated without refreshing the page.

1. Label Tools: ___Display or hide logical names next to field names. Logical names can be clicked to be copied.___
   * Show/Hide Tab and Section logical names
   * Show/Hide Field and Grid logical names
2. God Mode: ___Change field configurations or restore default configurations.___
   * Mark all fields optionnal
   * Enable all fields
   * Set all fields visible
3. Refresh
   * Refresh Ribbon: ___Reload ribbon__
   * Refresh fields data: __Reload form data__
4. Show option set values in fields: ___Display option set values in option labels___
5. Fill fields with randomized data: ___Allow to generate random data using different methods___
   * Enable Fill on Click: ___Allow to set random data in clicked fields. Can be deactivated.___
   * Fill Mandatory fields: ___Set random data in all mandatory fields on the form.___
   * Fill BPF fields: ___Set random data in all fields on the Business Process Flow.___
   * Fill All fields: ___Set random data in all fields on the form.___
   * Clear all fields: ___Set empty in all fields on the form.___
   * Restore original values: ___Allow you to rollback the fields data to the state at the form loading___
7. Clone the current record: ___Open a dialog with a record duplicating the data of the current record. The open record is not saved at this state___
8. Blur data: ___Blur fields and grids data. This button can be used on Homepage grids.___

<img height="550px" width="10px">



## 2\. Update Records
<img align="right" src="screenshots/jpg/2.UpdateRecords.jpg">

With this tool, you can update any field of any record on your environment. You can even update multiple records at once for bulk updates.

The default record loaded is the currently opened record. You can select different entity and records using the input fields at the top.

To update a field, select it from the dropdown menu. Then, enter a new value in the corresponding input field. You can always restore the original value if needed.

To remove a field from the update list, click the trash bin icon.

Each field type has a matching input type, such as a text box for text fields or a date picker for date fields. Input fields have an icon that you can click to open a tool that helps with data entry.

<img height="550px" width="10px">



## 3\. All Attributes
<img align="right" src="screenshots/jpg/3.AllAttributes.jpg">

This tool provides a convenient way to quickly access and review all the data of your open record.

It displays all the fields and values of the currently open records.

Expand the box to reveal additional values from the WebApi, such as the _FormattedValue_.

<img height="550px" width="10px">



## 4\. Option Set Tables
<img align="right" src="screenshots/jpg/4.OptionSetTables.jpg">

This tool offers a quick way to view all option sets associated with the currently open entity.

Each table displays all option labels and values for every available option set on the entity. You'll also find the list of fields that utilize it.

You can copy labels or values by simply clicking on them. Alternatively, you can copy the entire table to your clipboard.

<img height="550px" width="10px">



## 5\. Dirty Fields
<img align="right" src="screenshots/jpg/5.DirtyFields.jpg">

This tool displays the fields that have been changed but not yet saved.

By clicking on the box, you can trigger the focus of the fields on the form. This can even be on a different tab.

You can also enable an option to display a red box around the field controls on the form, making them visually stand out.

<img height="550px" width="10px">



## 6\. Related Records
<img align="right" src="screenshots/jpg/6.RelatedRecords.jpg">

This tool displays all relationships associated with the selected entity. It also lists related records for the selected record.

To view a record in detail, click on it to open a dialog. Alternatively, you can access a contextual menu (right-click) for other opening options.

<img height="550px" width="10px">



## 7\. WebResources Editor
<img align="right" src="screenshots/jpg/7.WebResourcesEditor.jpg">

This tool adds an editor directly to your browser, allowing you to modify web resources with ease. No more tedious updates or deployments! You can test your changes live in local, seeing the results instantly.

Here's how it works:

1. **Edit**: Modify any loaded file on the current page using the **Monaco Editor**, the same robust code editor that powers VS Code.
2. **Live Test**: After saving your changes, enable **live testing**. This reloads your page in debug mode, allowing your edited scripts to override the originals.
3. **Publish**: Once you're satisfied with your modifications, **publish** the files to make them permanent.

<img height="550px" width="10px">

