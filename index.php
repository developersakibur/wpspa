<!DOCTYPE html>
<html <?php language_attributes(); ?>>
<head>
    <meta charset="<?php bloginfo( 'charset' ); ?>">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <?php wp_head(); ?>
</head>
<body <?php body_class(); ?>>
<div id="loader"></div>
<div id="spa-wrapper">
  <nav id="spa-sidebar">
    <?php wp_nav_menu(['theme_location' => 'primary']); ?>
  </nav>
  <main id="app-content">
    <span id="page-title" style="display: none;"><?php echo wp_get_document_title(); ?></span>
    <?php
      while (have_posts()) : the_post();
        the_content();
      endwhile;
    ?>
  </main>
</div>
<?php wp_footer(); ?>
</body>
</html>
