/**
 * @file A tree sitter implementation for the vehicle specification language
 * @author Alistair Sirman <as9g21@soton.ac.uk>
 * @license MIT
 */

/// <reference types="tree-sitter-cli/dsl" />
// @ts-check

export default grammar({
  name: 'vehicle',
  extras: $ => [
    / /,
    $.tab,
    $.comment
  ],
  externals: $ => [$._terminator, $.tab],
  rules: {
    top: $ => repeat(choice(
      $.import,
      $.decl,
    )),
    comment: $ => /--.*/,
    import: $ => seq("import", repeat(seq($.name, ",")), $.name),
    decl : $ => seq(choice(
      seq($.annotation, optional($.ann_opts)),
      seq(field("function", $.name), repeat(field("variable", $.name_binder)), "=", $._expr),
      seq("type", field("type", $.name), repeat(field("variable", $.name_binder)), "=", $.type_expr),
      seq(field("function", $.name), ":", $.type_expr),
      seq("record", $.name, repeat($.name_binder), "where", "{", repeat(seq($.record_field_def, ",")), $.record_field_def, "}"),
    ), repeat1($._terminator)),
    name_binder: $ => choice(
      $.name,
      seq("(", $.name, ")"),
      seq("{", $.name, "}"),
      seq("{{", $.name, "}}"),
    ),
    record_field_def: $ => seq($.name, ":", $._expr),
    annotation: $ => choice(
      "@network",
      "@dataset",
      "@parameter",
      "@property",
      "@tensor",
      "@instance",
      "@builtin",
      "@typeclass"
    ),
    ann_opts: $ => choice(
      seq("name", "=", $.name),
      seq("infer", "=", $.boolean),
      seq("default", "=", $.natural),
    ),
    name: $ => token(/[a-zA-Z_]\w*/),
    boolean: $ => choice(token("True"), ("False")),
    natural: $ => token(/\d+/),
    rational: $ => token(/\d+\.\d+/),
    let_decl: $ => seq($.name_binder, "=", $._expr),
    type_binder: $ => choice(
      $._expr13,
      seq("{", $._expr1, "}"),
      seq("{{", $._expr1, "}}"),
      $.basic_binder,
    ),
    basic_binder: $ => choice(
      seq("(", $.name, ":", $._expr1, ")"),
      seq("{", $.name, ":", $._expr1, "}"),
      seq("{{", $.name, ":", $._expr1, "}}"),
    ),
    field_access: $ => choice(
      seq(".", /\w[\w\d_]*/),
    ),
    type_expr: $ => $._expr,
    _expr: $ => prec(0, choice(
      seq($._expr2, ":", $._expr1),
      $._expr1
    )),
    _expr1: $ => prec(1,choice(
      seq("forallT", repeat($.name_binder), ".", $._expr1),
      $._expr2
    )),
    _expr2: $ => prec(2, choice(
      seq("let", seq(repeat(seq($.let_decl, ",")), $.let_decl, "in", $._expr2)),
      seq("\\", seq(repeat(seq($.name_binder, ",")), $.name_binder, "->", $._expr2)),
      seq("foreach", seq(repeat(seq($.name_binder, ",")), $.name_binder, ".", $._expr2)),
      seq("forall", seq(repeat(seq($.name_binder, ",")), $.name_binder, ".", $._expr2)),
      seq("exists", seq(repeat(seq($.name_binder, ",")), $.name_binder, ".", $._expr2)),
      seq("forall", $.name_binder, "in", $._expr3, ".", $._expr2),
      seq("exists", $.name_binder, "in", $._expr3, ".", $._expr2),
      $._expr3,
    )),
    _expr3 : $ => prec(3, choice(
      $._expr4
    )),
    _expr4 : $ => prec(4, choice(
      seq("if", $._expr5, "then", $._expr5, "else", $._expr5),
      seq($._expr5, "::", $._expr4),
      $._expr5,
    )),
    _expr5 : $ => prec(5, choice(
      seq($._expr6, "=>", $._expr5),
      $._expr6,
    )),
    _expr6 : $ => prec(6, choice(
      $._expr7,
    )),
    _expr7 : $ => prec(7, choice(
      seq($._expr8, "and", $._expr7),
      seq($._expr8, "or", $._expr7),
      $._expr8,
    )),
    _expr8 : $ => prec(8, choice(
      seq($._expr8, "==", $._expr9),
      seq($._expr8, "!=", $._expr9),
      seq($._expr8, "<=", $._expr9),
      seq($._expr8, "<", $._expr9),
      seq($._expr8, ">=", $._expr9),
      seq($._expr8, ">", $._expr9),
      seq($._expr8, "==.", $._expr9),
      seq($._expr8, "!=.", $._expr9),
      seq($._expr8, "<=.", $._expr9),
      seq($._expr8, "<.", $._expr9),
      seq($._expr8, ">=.", $._expr9),
      seq($._expr8, ">.", $._expr9),
      $._expr9,
    )),
    _expr9 : $ => prec(9, choice(
      seq($._expr9, "+", $._expr10),
      seq($._expr9, "-", $._expr10),
      $._expr10,
    )),
    _expr10 : $ => prec(10, choice(
      seq($._expr10, "*", $._expr11),
      seq($._expr10, "/", $._expr11),
      seq("{", repeat(seq($.name, "=", $._expr, ",")), $.name, "=", $._expr, "}"),
      $._expr11,
    )),
    type_expr11: $ => $._expr11,
    _expr11 : $ => prec(11, choice(
      seq("-", $._expr11),
      seq($.type_binder, "->", $.type_expr11),
      $._expr12
    )),
    _expr12 : $ => prec(12, choice(
      seq($._expr12, "!", $._expr13),
      $._expr13,
    )),
    _expr13 : $ => prec(13, choice(
      seq(field("function", $._expr13), field("variable", $._expr15)),
      seq($._expr13, $.field_access),
      $._expr14,
    )),
    _expr14 : $ => prec(14, choice(
      seq("not", $._expr14),
      $._expr15,
    )),
    _expr15 : $ => prec(15, choice(
      seq("[", optional(seq(repeat(seq($._expr, ",")), $._expr)), "]"),
      token("Type"),
      $.name,
      token("()"),
      seq("(", $._expr, ")"),
      $.natural,
      $.boolean,
      $.rational,
      /\?[\w\d_]*/,
    )),
  }
});
