function cj() {
  var base = this;

  function safeGA() {
    try { if (typeof window.ga === 'function') { window.ga.apply(window, arguments); } } catch (e) {}
  }
  (function ensureEasing() {
    if (!jQuery || !jQuery.easing) return;
    if (!jQuery.easing.easeInOutQuart) {
      jQuery.easing.easeInOutQuart = function (x, t, b, c, d) {
        t /= d / 2; if (t < 1) return c / 2 * t * t * t * t + b; t -= 2; return -c / 2 * (t * t * t * t - 2) + b;
      };
    }
  })();
  function hasOwl() { return !!(jQuery && jQuery.fn && typeof jQuery.fn.owlCarousel === 'function'); }

  base.module = {
    model: {
      listener: [],
      path: '',
      data: '',
      popup: '',
      page: 0,
      totalpage: 13,
      navSeq: 0,
      loadingPending: false,
      pagecode: ['', 'Cover', 'History', 'CJrecommend', '', '', 'Specialchoice', 'Spam', 'Beksul', 'Bibigo', 'Hanppuri', 'Cheilmyungin', 'LeGouter', 'ending'],
      addEventListener: function (type, callback) { var propertype = {}; propertype[type] = callback; m.listener.push(propertype); },
      callback: function (type, params) { if (!m.listener.length) return null; for (var i = 0; i < m.listener.length; ++i) { if (m.listener[i][type]) m.listener[i][type](params); } },
      dispatchEvent: function (type, params) { m.callback(type, params); }
    },

    control: {
      computeTotalPage: function () {
        var prev = m.totalpage;
        var $cat = $('#catalogue');
        var declared = parseInt($cat.attr('data-pages'), 10);
        if (Number.isFinite(declared) && declared > 0) {
          m.totalpage = declared;
        } else {
          var maxIdx = 0;
          $('.gnb li').each(function () {
            var idxAttr = $(this).attr('data-index'); if (!idxAttr) return;
            (idxAttr + '').split(',').forEach(function (s) { var n = parseInt(s, 10); if (Number.isFinite(n) && n > maxIdx) maxIdx = n; });
          });
          m.totalpage = maxIdx > 0 ? maxIdx : 13;
        }
        if (m.totalpage !== prev) { if (m.page > m.totalpage) m.page = m.totalpage; c.arrow(); }
      },

      init: function () {
        c.computeTotalPage();
        $('#catalogue .contents').css('transition','none');
        if (typeof arrowis !== 'undefined' && arrowis) $(".arrow").css({ opacity: 1 });
        $("#catalogue").on("mouseenter focusin mouseleave focusout", function (e) {
          if (typeof arrowis !== 'undefined' && arrowis) return;
          switch (e.type) {
            case "mouseenter":
            case "focusin":  $(".arrow").stop(true).animate({ opacity: 1 }, 500); break;
            case "mouseleave":
            case "focusout": $(".arrow").stop(true).animate({ opacity: 0 }, 500); break;
          }
        });
        $(".arrow").on("click", function () { var fn = c[$(this).attr('action')]; if (typeof fn === 'function') fn(); });
      },

      loader: function (url, params) {
        c.close();
        var dataType = (params && params.dataType) ? params.dataType : 'html';
        v.loading(true);
        $.ajax({
          url: url, dataType: dataType, data: params,
          success: function (data) {
            if (params && params.type === 'detail' && (!data || !String(data).trim())) {
              v.detail(defaultDetailHTML(), params);
              m.loadingPending = true;
              return;
            }
            c.loadComplete(data, params);
            m.loadingPending = true;
          },
          error: function (xhr) {
            if (params && params.type === 'detail') { v.detail(defaultDetailHTML(), params); }
            m.loadingPending = true;
            try { console.warn('AJAX error:', url, xhr && xhr.status); } catch(e){}
          }
        });
      },

      loadComplete: function (data, params) {
        c.computeTotalPage();
        var viewFn = v[params.type]; if (typeof viewFn === 'function') { viewFn(data, params); }
        try { if (params && params.pidx) location.href = '#' + m.pagecode[Number(params.pidx)]; } catch (e) {}
        if (params.type === 'gnb') c.direct();
      },

      active: function (target) { if ($(".gnb .active").index() == $(target).index()) return; $(".gnb .active").removeClass('active'); $(target).addClass('active'); },

      connect: function (list) {
        c.computeTotalPage();
        var pagelist = (list + '').split(','); var target = parseInt(pagelist[0], 10);
        if (!Number.isFinite(target)) return; if (target < 1 || target > m.totalpage) return;
        m.page = target; m.dispatchEvent('pageChange', target); c.contents(target);
      },

      response: function () {},

      gnb: function (data) {
        var target = $(".gnb .active"), check;
        $(".gnb li").each(function () {
          var idxAttr = $(this).attr('data-index') || '';
          var refer = idxAttr.split(',');
          for (var i = 0; i < refer.length; ++i) { if (data == refer[i]) { check = true; if (target.index() != $(this).index()) c.active($(this)); } }
        });
        if (!check) target.removeClass('active');
      },

      contents: function (pidx) {
        var pagePath = '../contents/page' + pidx + '.html';
        safeGA('send', 'pageview', pagePath);
        var currentpage = m.path + 'page' + pidx + '.html';
        c.loader(currentpage, { type: 'contents', pidx: pidx });
      },

      detail: function () {},

      close: function () { if (!m.popup) return; $(".popup").remove(); m.popup = false; },

      arrow: function () {
        c.computeTotalPage();
        $("#catalogue .control").css('display', 'none');
        $(".arrow").removeClass('single').css('display', 'block');
        if (m.page == 1) { $(".arrow.prev").css('display', 'none'); $(".arrow.next").addClass("single"); }
        if (m.page == m.totalpage) { $(".arrow.next").css('display', 'none'); $(".arrow.prev").addClass("single"); }
      },

      prev: function () { c.computeTotalPage(); if (m.page > 1) c.connect(String(Number(m.page) - 1)); },
      next: function () { c.computeTotalPage(); if (m.page < m.totalpage) c.connect(String(Number(m.page) + 1)); },

      direct: function () {
        c.computeTotalPage();
        var locurl = location.href;
        if (locurl.indexOf('#all') != -1) { preview(); return; }
        if (locurl.indexOf('#') != -1) {
          var hash = locurl.substr(locurl.indexOf('#') + 1).replace(' ', '').replace(';', '');
          var mnum = hash.match(/^page(\d+)$/i);
          if (mnum) { var n = parseInt(mnum[1], 10); if (Number.isFinite(n) && n >= 1 && n <= m.totalpage) { c.connect(String(n)); return; } }
          var idx = 0; for (var i = 0; i < m.pagecode.length; ++i) { if (hash == m.pagecode[i]) idx = i; }
          if (Number(idx)) c.connect(String(idx));
        }
      }
    },

    view: {
      gnb: function (data) {
        $("#header .head").append(data);
        $(".gnb li").on('click', function (e) { if (e.type === "click") c.connect($(this).attr('data-index')); });
        c.computeTotalPage();
      },

      contents: function (data) {
        var $wrap = $("#catalogue .contents-wrap"); if (!$wrap.length) { $wrap = $("#catalogue"); }

        var mySeq = ++m.navSeq;

        var $old = $wrap.children('.contents').last();

        var $ghost = $(data);
        $ghost.css({
          position:'absolute', top:0, left:0, width:1286, height:826,
          opacity:0, visibility:'hidden', pointerEvents:'none', zIndex:2, transition:'none', display:'none'
        });
        $wrap.append($ghost);

        if ($old && $old.length) { $old.css({ opacity:0, visibility:'hidden', pointerEvents:'none', zIndex:0 }); }

        var $bg = $ghost.find('.bg');
        if ($bg.length) {
          var src = $bg.attr('src') || $bg.attr('data-src') || '';
          if ($bg.attr('data-src') && !$bg.attr('src')) { $bg.attr('src', src); }
        }

        var $list = $ghost.find('.list');
        $list.css({ display:'none' });

        var $targets = $list.find('a, img, button, .item, .card');
        if (!$targets.length) $targets = $list.children();
        $targets.css({ opacity:0, transform:'translateY(12px)' });

        var $thumbs = $ghost.find('.list img');
        var $primeThumbs = $thumbs.slice(0, Math.min(6, $thumbs.length));

        function waitForImages($imgs, timeoutMs) {
          return new Promise(function(resolve){
            if (!$imgs.length) return resolve();
            var done = 0, need = $imgs.length, settled = false;
            var to = setTimeout(function(){ if (!settled) { settled = true; resolve(); } }, timeoutMs);
            $imgs.each(function(_, el){
              if (el.complete && el.naturalWidth > 0) {
                if (++done >= need && !settled) { settled = true; clearTimeout(to); resolve(); }
                return;
              }
              $(el).one('load error', function(){
                if (++done >= need && !settled) { settled = true; clearTimeout(to); resolve(); }
              });
              var ds = el.getAttribute('data-src');
              if (ds && !el.getAttribute('src')) el.setAttribute('src', ds);
            });
          });
        }

        var revealStart = (window.performance && performance.now) ? performance.now() : Date.now();
        var MIN_DELAY = 200;

        function staggerIn($scope){
          var $t = $scope.find('.list').find('a, img, button, .item, .card');
          if (!$t.length) $t = $scope.find('.list').children();
          var delayStep = 60, i = 0;
          $t.each(function(){
            var $el = $(this);
            setTimeout(function(){
              $el.animate({ opacity:1 }, { duration:220, queue:false });
              $el.css({ transform:'translateY(0)' });
            }, i*delayStep);
            i++;
          });
        }

        function swapIn() {
          if (mySeq !== m.navSeq) return;

          $ghost.css({ display:'block' });
          $list.css({ display:'block' });
          $ghost.css({ opacity:1, visibility:'visible', pointerEvents:'auto', zIndex:1 });

          if ($old && $old.length) { requestAnimationFrame(function(){ $old.remove(); }); }

          staggerIn($ghost);
          $("#catalogue .control").css('display', 'block');

          if (m.loadingPending) { v.loading(false); m.loadingPending = false; }
        }

        function ready() {
          var now = (window.performance && performance.now) ? performance.now() : Date.now();
          var remain = Math.max(0, MIN_DELAY - (now - revealStart));
          setTimeout(swapIn, remain);
        }

        var bgReady = (!$bg.length) || ($bg[0].complete && $bg[0].naturalWidth > 0);
        var bgPromise = bgReady ? Promise.resolve() : new Promise(function(res){
          $bg.one('load error', res);
          if ($bg[0].complete) $bg.trigger('load');
          setTimeout(res, 1500);
        });

        Promise.all([
          bgPromise,
          waitForImages($primeThumbs, 1200)
        ]).then(function(){ ready(); });
      },

      detail: function (data, params) {
        m.popup = true;
        $("#wrap").append("<div class='popup'></div>");
        var $pop = $(".popup").css('opacity', 0).html(data);
        $pop.append("<div class='overlay'></div>");

        var itemInfo = null;
        try { var list = m.data && m.data["cate" + params.cate]; if (list) itemInfo = list[Number(params.idx) - 1]; } catch (e) {}
        var imgSrc = itemInfo && itemInfo.img ? itemInfo.img : null;
        var alt = (itemInfo && itemInfo.alt) || '';

        function render(src) {
          var $c = $pop.find('.detail .contents');
          if (src) { $c.append("<img src='" + src + "' alt='" + alt + "'/>"); }
          else { $c.append("<div style='padding:40px;text-align:center;color:#333;font-size:14px'>이미지를 불러오지 못했습니다.</div>"); }

          if (itemInfo && itemInfo.buy) { $pop.find('.buy').attr('href', itemInfo.buy).show(); $pop.find('.view_set').hide(); }
          else { $pop.find('.buy').hide(); }

          if (m.page) $pop.find('.close').attr('href', '#' + m.pagecode[m.page]);
          $pop.on('click', '.close', function () { c.close(); });

          $pop.stop().animate({ opacity: 1 }, 400, "easeInOutQuart", function () {
            if (m.loadingPending) { v.loading(false); m.loadingPending = false; }
          });
        }

        if (imgSrc) render(imgSrc);
        else {
          var tries = [
            'img/goods/thumb/cate' + params.cate + '/' + params.cate + '-' + params.idx + '.png',
            'img/goods/all/cate' + params.cate + '/' + params.cate + '-' + params.idx + '.png',
            'img/goods/all/' + params.cate + '-' + params.idx + '.png',
            'img/goods/all/' + params.cate + '/' + params.idx + '.png'
          ];
          (function pick(i) {
            if (i >= tries.length) { render(null); return; }
            var test = new Image();
            test.onload  = function(){ render(test.src); };
            test.onerror = function(){ pick(i + 1); };
            test.src = tries[i];
          })(0);
        }
      },

      preview: function (data) {
        m.popup = true;
        $("#wrap").append("<div class='popup'></div>");
        $(".popup").html(data);
        $(".popup").append("<div class='overlay'></div>");
        $(".popup").css('opacity', 0).stop().animate({ opacity: 1 }, 400, "easeInOutQuart", function () {
          fitPreviewGrid();
          if (m.loadingPending) { v.loading(false); m.loadingPending = false; }
        });
        if (m.page) $(".popup .close").attr('href', '#' + m.pagecode[m.page]);
        $(".popup").on('click', '.close', function () { c.close(); $(window).off('resize.fitPreview'); });
        $(window).off('resize.fitPreview').on('resize.fitPreview', fitPreviewGrid);
        location.href = '#all';
      },

      json: function (data) { m.data = data; },

      loading: function (status) {
        $('.loading').stop(true).animate({ opacity: 0 }, 200, function () { $(this).remove(); });
        if (!status) return;
        $("body").append(" <div class='loading'><div class='overlay'></div><img class='gif' src='img/loading.gif' alt='loading'/></div>");
        $('.loading').css('opacity', 0).stop(true).animate({ opacity: 1 }, 200);
      }
    },

    utils: {},

    log: {
      msg: function () { if (!arguments.length) return; var argis = ""; for (var i = 0; i < arguments.length; ++i) argis += arguments[i] + " "; },
      print: function (str) { try { console.log(str); } catch (e) {} }
    }
  },

  m = base.module.model,
  c = base.module.control,
  v = base.module.view,
  u = base.module.utils,
  log = base.module.log;

  m.addEventListener('pageChange', c.gnb);
  m.addEventListener('pageChange', c.arrow);

  window.detail  = function (cate, idx) { c.loader(m.path + 'detail.html', { type: 'detail',  cate: Number(cate), idx: Number(idx) }); return false; };
  window.preview = function ()           { c.loader('inc/preview.html',    { type: 'preview' });                                     return false; };

  function fitPreviewGrid(){
    var $box  = $('.popup .preview'); if(!$box.length) return;
    var $wrap = $box.find('.cont_all');
    var $grid = $box.find('.cont');
    var COLS=5, ROWS=3, ITEM_W=204, ITEM_H=150, GAP=16;
    $grid.css({ display:'grid', gridTemplateColumns:'repeat('+COLS+','+ITEM_W+'px)', gridTemplateRows:'repeat('+ROWS+','+ITEM_H+'px)', gap:GAP+'px', transform:'none', width:(COLS*ITEM_W+(COLS-1)*GAP)+'px', margin:'0 auto' });
    var wrapW = $wrap.innerWidth(); var fullW = COLS*ITEM_W+(COLS-1)*GAP; var left  = Math.max(0,(wrapW-fullW)/2); $grid.css('margin-left', left+'px');
  }

  function defaultDetailHTML() {
    return "" +
      "<div class='detail'>" +
        "<div class='head'><a href='#' class='close'><img src='img/preview/btn_close.png' alt='닫기'></a></div>" +
        "<div class='contents'></div>" +
        "<a class='buy' href='#' target='_blank' style='display:none'></a>" +
        "<a class='view_set' href='#' style='display:none'></a>" +
      "</div>";
  }
}
