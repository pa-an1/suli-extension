// Copyright 2018 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

'use strict';

chrome.runtime.onInstalled.addListener(function() {
  
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
    var fileName = '';
    if (tab.url.includes('product')) {
      fileName = 'scan.js'
    } else if (tab.url.includes('order')) {
      fileName = 'script.js'
    }
    chrome.tabs.executeScript(null, {file: fileName});
  });
});
