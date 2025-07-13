<?php
function spa_theme_scripts() {
  wp_enqueue_style('spa-style', get_stylesheet_uri());
  wp_enqueue_script('spa-js', get_template_directory_uri() . '/app.js', [], false, true);
}
add_action('wp_enqueue_scripts', 'spa_theme_scripts');

function spa_register_menus() {
  register_nav_menus(['primary' => __('Primary Menu')]);
}
add_action('after_setup_theme', 'spa_register_menus');

