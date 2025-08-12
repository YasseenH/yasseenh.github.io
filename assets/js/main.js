(function ($) {
  var $window = $(window),
    $body = $("body"),
    $html = $("html");

  // Breakpoints.
  breakpoints({
    large: ["981px", "1680px"],
    medium: ["737px", "980px"],
    small: ["481px", "736px"],
    xsmall: [null, "480px"],
  });

  // Play initial animations on page load.
  $window.on("load", function () {
    window.setTimeout(function () {
      $body.removeClass("is-preload");
    }, 100);
  });

  // Touch mode.
  if (browser.mobile) {
    var $wrapper;

    // Create wrapper.
    $body.wrapInner('<div id="wrapper" />');
    $wrapper = $("#wrapper");

    // Hack: iOS vh bug.
    if (browser.os == "ios")
      $wrapper.css("margin-top", -25).css("padding-bottom", 25);

    // Pass scroll event to window.
    $wrapper.on("scroll", function () {
      $window.trigger("scroll");
    });

    // Scrolly.
    $window.on("load.hl_scrolly", function () {
      $(".scrolly").scrolly({
        speed: 1500,
        parent: $wrapper,
        pollOnce: true,
      });

      $window.off("load.hl_scrolly");
    });

    // Enable touch mode.
    $html.addClass("is-touch");
  } else {
    // Scrolly.
    $(".scrolly").scrolly({
      speed: 1500,
    });
  }

  // Header.
  var $header = $("#header"),
    $headerTitle = $header.find("header"),
    $headerContainer = $header.find(".container");

  // Make title fixed.
  if (!browser.mobile) {
    $window.on("load.hl_headerTitle", function () {
      breakpoints.on(">medium", function () {
        $headerTitle
          .css("position", "fixed")
          .css("height", "auto")
          .css("top", "50%")
          .css("left", "0")
          .css("width", "100%")
          .css("margin-top", $headerTitle.outerHeight() / -2);
      });

      breakpoints.on("<=medium", function () {
        $headerTitle
          .css("position", "")
          .css("height", "")
          .css("top", "")
          .css("left", "")
          .css("width", "")
          .css("margin-top", "");
      });

      $window.off("load.hl_headerTitle");
    });
  }

  // Scrollex.
  breakpoints.on(">small", function () {
    $header.scrollex({
      terminate: function () {
        $headerTitle.css("opacity", "");
      },
      scroll: function (progress) {
        // Fade out title as user scrolls down.
        if (progress > 0.5) x = 1 - progress;
        else x = progress;

        $headerTitle.css("opacity", Math.max(0, Math.min(1, x * 2)));
      },
    });
  });

  breakpoints.on("<=small", function () {
    $header.unscrollex();
  });

  // Main sections.
  $(".main").each(function () {
    var $this = $(this),
      $primaryImg = $this.find(".image.primary > img"),
      $bg,
      options;

    // No primary image? Bail.
    if ($primaryImg.length == 0) return;

    // Create bg and append it to body.
    $bg = $('<div class="main-bg" id="' + $this.attr("id") + '-bg"></div>')
      .css(
        "background-image",
        'url("assets/css/images/overlay.png"), url("' +
          $primaryImg.attr("src") +
          '")'
      )
      .appendTo($body);

    // Scrollex.
    $this.scrollex({
      mode: "middle",
      delay: 200,
      top: "-10vh",
      bottom: "-10vh",
      init: function () {
        $bg.removeClass("active");
      },
      enter: function () {
        $bg.addClass("active");
      },
      leave: function () {
        $bg.removeClass("active");
      },
    });
  });

  // Enhanced functionality
  // Progress bar
  $(window).scroll(function () {
    var scrollTop = $(window).scrollTop();
    var docHeight = $(document).height() - $(window).height();
    var scrollPercent = (scrollTop / docHeight) * 100;
    $("#progressBar").css("width", scrollPercent + "%");

    // Show/hide back to top button
    if (scrollTop > 300) {
      $("#backToTop").addClass("visible");
    } else {
      $("#backToTop").removeClass("visible");
    }
  });

  // Mobile touch improvements
  if (browser.mobile) {
    // Increase touch targets for mobile
    $(".goto-next").css({
      "min-height": "44px",
      "min-width": "44px",
    });

    // Disable section indicator on mobile for better performance
    $(".section-indicator").hide();

    // Add touch feedback
    $(".project, .skill-category ul.icons-grid li")
      .on("touchstart", function () {
        $(this).addClass("touch-active");
      })
      .on("touchend touchcancel", function () {
        $(this).removeClass("touch-active");
      });
  }

  // Initialize back to top button
  $(document).ready(function () {
    console.log("Back to top button initialized"); // Debug log
    console.log("Button element:", $("#backToTop")); // Debug log
  });

  // Smooth scroll to top
  $("#backToTop").click(function (e) {
    e.preventDefault();
    console.log("Back to top clicked!"); // Debug log
    $("html, body").animate({ scrollTop: 0 }, 800, "swing");
  });

  // Enhanced scroll animations
  $(window).scroll(function () {
    $(".main.special").each(function () {
      var elementTop = $(this).offset().top;
      var elementBottom = elementTop + $(this).outerHeight();
      var viewportTop = $(window).scrollTop();
      var viewportBottom = viewportTop + $(window).height();

      if (elementBottom > viewportTop && elementTop < viewportBottom) {
        $(this).addClass("animate-in");
      }
    });
  });

  // Enhanced navigation with smooth section jumping
  $('a[href^="#"]')
    .not("#backToTop")
    .click(function (e) {
      e.preventDefault();
      var target = $(this.getAttribute("href"));
      if (target.length) {
        // Add a subtle highlight effect to the target section
        target.addClass("section-highlight");
        setTimeout(function () {
          target.removeClass("section-highlight");
        }, 2000);

        // Smooth jump to section
        $("html, body").animate(
          {
            scrollTop: target.offset().top - 50,
          },
          800,
          "swing"
        );
      }
    });

  // Add section indicator
  $('<div class="section-indicator">')
    .html(
      '<span class="current-section">1</span> / <span class="total-sections">4</span>'
    )
    .appendTo("body");

  // Update section indicator on scroll
  $(window).scroll(function () {
    var scrollTop = $(window).scrollTop();
    var currentSection = 1;

    $(".main.special").each(function (index) {
      var elementTop = $(this).offset().top;
      if (scrollTop >= elementTop - 100) {
        currentSection = index + 1;
      }
    });

    $(".current-section").text(currentSection);
  });

  // Enhanced hover effects for skills
  $(".skill-category ul.icons-grid li").hover(
    function () {
      $(this).find(".icon").addClass("pulse");
    },
    function () {
      $(this).find(".icon").removeClass("pulse");
    }
  );

  // Add pulse animation
  $("<style>")
    .prop("type", "text/css")
    .html(
      `
				@keyframes pulse {
					0% { transform: scale(1); }
					50% { transform: scale(1.1); }
					100% { transform: scale(1); }
				}
				.pulse {
					animation: pulse 0.6s ease-in-out;
				}
			`
    )
    .appendTo("head");
})(jQuery);
