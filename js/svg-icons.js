
/////// Cards Animation Start

document.getElementById('cards').addEventListener('mouseenter', activateCards);

    var animData = {
        wrapper: document.getElementById('cards'),
        animType: 'html',
        loop: false,
        prerender: true,
        autoplay: false,
        path: '../../pub/img/svg-icons/cardsBBVA.json'
    };

    var anim = bodymovin.loadAnimation(animData);
    //console.log(bodymovin.loadAnimation(animData));
    //window.onresize = anim.resize.bind(anim);
      function activateCards () {
          anim.goToAndPlay(1, true);
      }

/////// Planes Animation Start

document.getElementById('planes').addEventListener('mouseenter', activatePlanes);

var planesData = {
    wrapper: document.getElementById('planes'),
    animType: 'html',
    loop: false,
    prerender: true,
    autoplay: false,
    path: '../../pub/img/svg-icons/planesBBVA.json'
};

var animPlanes = bodymovin.loadAnimation(planesData);

function activatePlanes () {
    animPlanes.goToAndPlay(1, true);
}

/////// Branches Animation Start

document.getElementById('branches').addEventListener('mouseenter', activateBranches);

var branchesData = {
    wrapper: document.getElementById('branches'),
    animType: 'html',
    loop: false,
    prerender: true,
    autoplay: false,
    path: '../../pub/img/svg-icons/branchesBBVA.json'
};

var animBranches = bodymovin.loadAnimation(branchesData);

function activateBranches () {
    animBranches.goToAndPlay(1, true);
}

/////// Security Animation Start

document.getElementById('security').addEventListener('mouseenter', activatesecurity);

var securityData = {
    wrapper: document.getElementById('security'),
    animType: 'html',
    loop: false,
    prerender: true,
    autoplay: false,
    path: '../../pub/img/svg-icons/securityBBVA.json'
};

var animSecurity = bodymovin.loadAnimation(securityData);

function activatesecurity () {
    animSecurity.goToAndPlay(1, true);
}


/////// Alerts Animation Start

document.getElementById('alerts').addEventListener('mouseenter', activateAlerts);

var alertsData = {
    wrapper: document.getElementById('alerts'),
    animType: 'html',
    loop: false,
    prerender: true,
    autoplay: false,
    path: '../../pub/img/svg-icons/alertsBBVA.json'
};

var animAlerts = bodymovin.loadAnimation(alertsData);

function activateAlerts () {
    animAlerts.goToAndPlay(1, true);
}

/////// Software Animation Start

document.getElementById('software').addEventListener('mouseenter', activateSoftware);

var softwareData = {
    wrapper: document.getElementById('software'),
    animType: 'html',
    loop: false,
    prerender: true,
    autoplay: false,
    path: '../../pub/img/svg-icons/softwareBBVA.json'
};

var animSoftware = bodymovin.loadAnimation(softwareData);

function activateSoftware () {
    animSoftware.goToAndPlay(1, true);
}
