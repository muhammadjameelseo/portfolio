/* Jamil Buzdar website: mobile menu, image viewer, contact form */
(function () {
  'use strict';

  /* ---------- mobile menu ---------- */
  var toggle = document.querySelector('.nav-toggle');
  var nav = document.getElementById('site-nav');
  if (toggle && nav) {
    toggle.addEventListener('click', function () {
      var open = nav.classList.toggle('open');
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
      toggle.textContent = open ? 'Close' : 'Menu';
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && nav.classList.contains('open')) {
        nav.classList.remove('open');
        toggle.setAttribute('aria-expanded', 'false');
        toggle.textContent = 'Menu';
        toggle.focus();
      }
    });
  }

  /* ---------- image viewer for screenshots ---------- */
  var buttons = document.querySelectorAll('.shot-btn');
  if (buttons.length) {
    var box = document.createElement('div');
    box.className = 'lightbox';
    box.setAttribute('role', 'dialog');
    box.setAttribute('aria-modal', 'true');
    box.setAttribute('aria-label', 'Enlarged screenshot');
    var close = document.createElement('button');
    close.type = 'button';
    close.className = 'lb-close';
    close.textContent = 'Close';
    var big = document.createElement('img');
    big.alt = '';
    box.appendChild(close);
    document.body.appendChild(box);
    var opener = null;

    var hide = function () {
      box.classList.remove('open');
      document.body.style.overflow = '';
      if (opener) { opener.focus(); }
    };
    buttons.forEach(function (btn) {
      btn.addEventListener('click', function () {
        opener = btn;
        var img = btn.querySelector('img');
        big.src = btn.getAttribute('data-full') || img.src;
        big.alt = img.alt;
        if (!big.parentNode) { box.appendChild(big); }
        box.classList.add('open');
        box.scrollTop = 0;
        document.body.style.overflow = 'hidden';
        close.focus();
      });
    });
    close.addEventListener('click', hide);
    box.addEventListener('click', function (e) { if (e.target === box) { hide(); } });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && box.classList.contains('open')) { hide(); }
    });
  }

  /* ---------- contact form ---------- */
  var form = document.getElementById('contact-form');
  if (form) {
    var status = document.getElementById('form-status');
    var submit = form.querySelector('button[type="submit"]');
    var endpoint = form.getAttribute('data-ajax');
    var mailTo = form.getAttribute('data-mailto');

    var mailtoLink = function () {
      var f = new FormData(form);
      var body = [
        'Name: ' + (f.get('name') || ''),
        'Email: ' + (f.get('email') || ''),
        'Phone: ' + (f.get('phone') || ''),
        'Website: ' + (f.get('website') || ''),
        'Service: ' + (f.get('service') || ''),
        '',
        f.get('message') || ''
      ].join('\n');
      return 'mailto:' + mailTo + '?subject=' + encodeURIComponent('SEO inquiry from ' + (f.get('name') || 'website')) + '&body=' + encodeURIComponent(body);
    };

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      status.className = 'form-status';
      status.textContent = '';
      if (!form.reportValidity()) { return; }

      submit.disabled = true;
      var label = submit.textContent;
      submit.textContent = 'Sending…';

      fetch(endpoint, {
        method: 'POST',
        body: new FormData(form),
        headers: { 'Accept': 'application/json' }
      })
        .then(function (r) { return r.json().then(function (j) { return { ok: r.ok, data: j }; }); })
        .then(function (res) {
          if (res.ok && (res.data.success === true || res.data.success === 'true')) {
            var name = (new FormData(form).get('name') || '').toString().split(' ')[0];
            document.getElementById('done-name').textContent = name ? ', ' + name : '';
            form.classList.add('sent');
            document.getElementById('form-done').focus();
          } else {
            throw new Error('not sent');
          }
        })
        .catch(function () {
          status.className = 'form-status error';
          status.innerHTML = 'The message did not send. Try again, or <a href="' + mailtoLink() + '">email it from your mail app</a>.';
          submit.disabled = false;
          submit.textContent = label;
        });
    });
  }
})();
