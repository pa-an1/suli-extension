// Copyright 2018 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

'use strict';

chrome.declarativeContent.onPageChanged.removeRules(undefined, function() {
  chrome.declarativeContent.onPageChanged.addRules([{
    conditions: [new chrome.declarativeContent.PageStateMatcher({
      pageUrl: {hostEquals: 'sellercenter.lazada.vn'},
    })
    ],
        actions: [new chrome.declarativeContent.ShowPageAction()]
  }]);
});

chrome.pageAction.onClicked.addListener(function(tab) {
  chrome.tabs.executeScript(null, {file: "script.js"});
});