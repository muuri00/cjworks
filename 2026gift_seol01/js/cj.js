function cj() {
  var base = this;

  (base.module = {
    model: {
      listener: [],
      path: '',
      data: '',
      popup: '',
      page: 0,
      pagecode: [
        '',
        'cover',
        'history',
        'Specialgiftset',
        'Specialchoice',
        'Spamgiftset',
        'Spam',
        'Oilgiftset',
        'Beksul',
        'Bibigo',
        'Seaweedgiftset',
        'Hanppuri',
        'Cheilmyungin',
        'Legouter',
        'Allitems',
        'ending',
      ],
      addEventListener: function (type, callback) {
        var propertype = {};
        propertype[type] = callback;
        m.listener.push(propertype);
      },
      callback: function (type, params) {
        if (!m.listener.length) return null;
        for (var i = 0; i < m.listener.length; ++i) {
          if (m.listener[i][type]) m.listener[i][type](params);
        }
      },
      dispatchEvent: function (type, params) {
        m.callback(type, params);
      },
    },

    control: {
      init: function () {
        if (arrowis) $('.arrow').css({ opacity: 1 });

        $('#catalogue').bind('mouseenter focusin mouseleave focusout', function (e) {
          if (arrowis) return;
          switch (e.type) {
            case 'mouseenter':
            case 'focusin':
              $('.arrow').stop().animate({ opacity: 1 }, 500);
              break;
            case 'mouseleave':
            case 'focusout':
              $('.arrow').stop().animate({ opacity: 0 }, 500);
              break;
          }
        });

        $('.arrow').bind('click', function () {
          eval(c[$(this).attr('action')]());
        });
      },

      loader: function (url, params) {
        c.close();
        var dataType = 'html';
        try {
          if (params.dataType) dataType = params.dataType;
        } catch (e) {}
        v.loading(true);

        $.ajax({
          url: url,
          dataType: dataType,
          data: params,
          success: function (data) {
            // detail 응답이 비어도 폴백 생성
            if (params && params.type === 'detail' && (!data || !String(data).trim())) {
              v.detail(defaultDetailHTML(), params);
              v.loading(false);
              return;
            }
            c.loadComplete(data, params);
            v.loading(false);
          },
          error: function () {
            if (params && params.type === 'detail') {
              v.detail(defaultDetailHTML(), params);
            }
            v.loading(false);
          },
        });
      },

      loadComplete: function (data, params) {
        eval(v[params.type])(data, params);
        try {
          if (params.pidx) location.href = '#' + m.pagecode[Number(params.pidx)];
        } catch (e) {}
        if (params.type == 'gnb') c.direct();
      },

      active: function (target) {
        if ($('.gnb .active').index() == $(target).index()) return;
        $('.gnb .active').removeClass('active');
        $(target).addClass('active');
      },

      connect: function (list) {
        var pagelist = list.split(',');
        if (pagelist[0] < 1 || pagelist[0] > m.totalpage) return;
        m.page = pagelist[0];
        m.dispatchEvent('pageChange', pagelist[0]);
        c.contents(pagelist[0]);
      },

      response: function () {},

      gnb: function (data) {
        var target = $('.gnb .active'); var check;
        $('.gnb li').each(function () {
          var refer = $(this).attr('data-index').split(',');
          for (var i = 0; i < refer.length; ++i) {
            if (data == refer[i]) {
              check = true;
              if (target.index() != $(this).index()) c.active($(this));
            }
          }
        });
        if (!check) target.removeClass('active');
      },

      contents: function (pidx) {
        var page = '/2018gifts/contents/page' + pidx + '.html';
        ga('send', 'pageview', page);
        var currentpage = m.path + 'page' + pidx + '.html';
        c.loader(currentpage, { type: 'contents', pidx: pidx });
      },

      detail: function () {},

      close: function () {
        if (!m.popup) return;
        $('.popup').remove();
        m.popup = false;
      },

      arrow: function () {
        $('#catalogue .control').css('display', 'none');
        $('.arrow').removeClass('single').css('display', 'block');
        if (m.page == 1) {
          $('.arrow.prev').css('display', 'none');
          $('.arrow.next').addClass('single');
        }
        if (m.page == m.totalpage) {
          $('.arrow.next').css('display', 'none');
          $('.arrow.prev').addClass('single');
        }
      },

      prev: function () {
        if (m.page > 1) c.connect(String(Number(m.page) - 1));
      },

      next: function () {
        if (m.page < m.totalpage) c.connect(String(Number(m.page) + 1));
      },

      direct: function () {
        var locurl = location.href;
        if (locurl.indexOf('#all') != -1) {
          preview();
          return;
        }
        if (locurl.indexOf('#') != -1) {
          var pageNo = locurl.substr(locurl.indexOf('#') + 1);
          pageNo = pageNo.replace(' ', '');
          pageNo = pageNo.replace(';', '');
          var idx = 0;
          for (var i = 0; i < m.pagecode.length; ++i) {
            if (pageNo == m.pagecode[i]) idx = i;
          }
          if (Number(idx)) c.connect(String(idx));
        }
      },
    },

    view: {
      gnb: function (data) {
        $('#header .head').append(data);
        $('.gnb li').bind('click', function (e) {
          if (e.type === 'click') c.connect($(this).attr('data-index'));
        });
      },

      contents: function (data) {
        var $wrap = $('#catalogue .contents-wrap');
        $wrap.append(data);

        var $pages = $wrap.children('.contents');
        if ($pages.length < 2) return;

        var $new = $pages.last();
        var $old = $pages.eq(-2);

        if ($pages.length > 2) {
          $pages.slice(0, -2).remove();
        }

        $new.css({ position: 'absolute', top: 0, left: 0, width: 1286, height: 826 });
        var $bg = $new.find('.bg').css({
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          display: 'block',
          'pointer-events': 'none',
        });

        $new.find('.list').css({ display: 'none' });
        $new.css('opacity', 0);

        function reveal() {
          $new.find('.list').css({ display: 'block' });
          var $items = $new.find('.list img, .list a');
          var delay = 0;
          $items.each(function () {
            var $el = $(this);
            $el.css({ opacity: 0, transform: 'translateY(12px)' });
            setTimeout(function () {
              $el.animate({ opacity: 1 }, 250);
              $el.css({ transform: 'translateY(0)' });
            }, delay);
            delay += 80;
          });

          $new.animate({ opacity: 1 }, 500, 'easeInOutQuart', function () {
            $old.remove();
            $('#catalogue .control').css('display', 'block');
          });
        }

        var revealed = false;
        function safeReveal() {
          if (!revealed) {
            revealed = true;
            reveal();
          }
        }

        if ($bg.length && ($bg[0].complete || $bg.height() > 0)) {
          safeReveal();
        } else if ($bg.length) {
          $bg.one('load', safeReveal);
          if ($bg[0].complete) $bg.trigger('load');
        } else {
          safeReveal();
        }
        setTimeout(safeReveal, 800);
      },

      // detail: 데이터 없어도 반드시 팝업 생성 + 폴백 이미지 시도
      detail: function (data, params) {
        m.popup = true;

        $('#wrap').append("<div class='popup'></div>");
        var $pop = $('.popup').css('opacity', 0).html(data);
        $pop.append("<div class='overlay'></div>");

        var itemInfo = null;
        try {
          var list = m.data && m.data['cate' + params.cate];
          if (list) itemInfo = list[Number(params.idx) - 1];
        } catch (e) {}

        var imgSrc = itemInfo && itemInfo.img ? itemInfo.img : null;
        var alt = (itemInfo && itemInfo.alt) || '';

        function render(src) {
          var $c = $pop.find('.detail .contents');
          if (src) {
            $c.append("<img src='" + src + "' alt='" + alt + "'/>");
          } else {
            $c.append(
              "<div style='padding:40px;text-align:center;color:#333;font-size:14px'>이미지를 불러오지 못했습니다.</div>"
            );
          }

          if (itemInfo && itemInfo.buy) {
            $pop.find('.buy').attr('href', itemInfo.buy).show();
            $pop.find('.view_set').hide();
          } else {
            $pop.find('.buy').hide();
          }

          if (m.page) $pop.find('.close').attr('href', '#' + m.pagecode[m.page]);
          $pop.on('click', '.close', function () { c.close(); });

          $pop.stop().animate({ opacity: 1 }, 400, 'easeInOutQuart');
        }

        if (imgSrc) {
          render(imgSrc);
        } else {
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

      json: function (data) {
        m.data = data;
      },

      // ★ 미리보기: 작년 방식(CSS로만 레이아웃), JS 보정 제거
      preview: function (data) {
        m.popup = true;
        $('#wrap').append("<div class='popup'></div>");
        $('.popup').html(data);
        $('.popup').append("<div class='overlay'></div>");
        $('.popup').css('opacity', 0)
          .stop()
          .animate({ opacity: 1 }, 400, 'easeInOutQuart');

        if (m.page) $('.popup .close').attr('href', '#' + m.pagecode[m.page]);
        $('.popup').on('click', '.close', function () {
          c.close();
        });

        location.href = '#all';
      },

      loading: function (status) {
        $('.loading').stop().animate({ opacity: 0 }, 400, 'easeInOutQuart', function () {
          $(this).remove();
        });
        if (!status) return;
        $('body').append(
          " <div class='loading'><div class='overlay'></div><img class='gif' src='img/loading.gif' alt='loading'/></div>"
        );
        $('.loading').css('opacity', 0).stop().animate({ opacity: 1 }, 400, 'easeInOutQuart');
      },
    },

    utils: {},

    log: {
      msg: function () {
        if (!arguments.length) return;
        var argis = '';
        for (var i = 0; i < arguments.length; ++i) argis += arguments[i] + ' ';
      },
      print: function (str) {
        try { console.log(str); } catch (e) {}
      },
    },
  }),
  (m = base.module.model),
  (c = base.module.control),
  (v = base.module.view),
  (u = base.module.utils),
  (log = base.module.log);

  m.addEventListener('pageChange', c.gnb);
  m.addEventListener('pageChange', c.arrow);

  // window.detail: AJAX 성공/실패 모두 loader에서 처리
  window.detail = function (cate, idx) {
    c.loader(m.path + 'detail.html', {
      type: 'detail',
      cate: Number(cate),
      idx: Number(idx),
    });
    return false;
  };

  // detail.html 폴백 마크업
  function defaultDetailHTML() {
    return "" +
      "<div class='detail'>" +
        "<div class='head'>" +
          "<a href='#' class='close'><img src='img/preview/btn_close.png' alt='닫기'></a>" +
        "</div>" +
        "<div class='contents'></div>" +
        "<a class='buy' href='#' target='_blank' style='display:none'></a>" +
        "<a class='view_set' href='#' style='display:none'></a>" +
      "</div>";
  }
}
