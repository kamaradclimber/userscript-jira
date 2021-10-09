// ==UserScript==
// @name         Jira Peer programming
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  display pictures of all people peering on a given ticket
// @author       Grégoire Seux
// @homepage     https://github.com/kamaradclimber/userscript-jira
// @match        https://jira.criteois.com/secure/RapidBoard.jspa*
// @icon         https://www.google.com/s2/favicons?domain=criteois.com
// @updateURL    https://openuserjs.org/meta/kamaradclimber/peering.meta.js
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    function displayPeer(ticket_entity, peer_name) {
        var image_url = `https://jira.criteois.com/secure/useravatar?ownerId=${peer_name}`;
        displayPicture(ticket_entity, image_url, peer_name);
    }

    function displayPicture(ticket_entity, picture_url, peer_name) {
        var avatar_entity = ticket_entity.querySelector(".ghx-avatar");
        var new_avatar = avatar_entity.childNodes[0].cloneNode(true);
        avatar_entity.appendChild(new_avatar);
        new_avatar.src = picture_url;
        new_avatar.dataset['tooltip'] = `Peer: ${peer_name}`;
        new_avatar.alt = `Peer: ${peer_name}`;
    }

    var onTicketAvailable = function (resolve) {
        var ticketLinkSelector = 'div[data-issue-key]';
        document.querySelectorAll(ticketLinkSelector)
        var tickets = document.querySelectorAll(ticketLinkSelector);
        if (tickets && tickets.length > 0) {
            tickets.forEach(resolve);
        } else {
            window.setTimeout(function () {
                console.log("No ticket visible, relaunching timer");
                onTicketAvailable(resolve);

            }, 100);
        }
    }

    // takes a span object whose text is a list of labels
    var extractLabels = function(extraField) {
        return extraField.innerText.split(', ');
    }

    onTicketAvailable(function (ticket) {
        var labelSelector = ".ghx-extra-field-content";
        ticket.querySelectorAll(labelSelector).forEach(function(extraField) {
            extractLabels(extraField).forEach(function(label) {
                console.log(`Treating label ${label}`);
                const capturingRegex = /pair-with-(?<peer>.+)/;
                const found = label.match(capturingRegex);
                if (found) {
                    var peer_name = found.groups.peer
                    displayPeer(ticket, peer_name);
                }
                //TODO(g.seux): we could probably work with labels source:incident, source:interrupt and add emojis as well.
            })
        })
    });

})();
