(module
  ;; Uncomment the following import statement if you wish to log values using Javascript's console.log
  ;;
  ;; (call $log (i32.const <msg_id>) (local.get <some_value_to_be_logged>))
  ;; Where <msg_id> is some arbitrary integer used by the host environment to identify what value is being logged
  ;;
  ;; (import "console" "log"
  ;;   (func $log
  ;;     (param i32) ;; Message id
  ;;     (param i32) ;; Logged value
  ;;   )
  ;; )

  (memory (export "memory") 1)

  (global $output_ptr i32 (i32.const 0x0))
  (global $minus_sign i32 (i32.const 0x2D))  ;; ASCII "-"

  ;; - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
  (func (export "itoa")
        (param $int_val   i32) ;; Value to convert
        (param $is_signed i32) ;; Treat integer value as signed (I.E. is it a twos complement value)?
        (result i32 i32)       ;; Offset + length of ASCII result

    (local $digit_ptr   i32)
    (local $is_negative i32)

    ;; Maximum number of characters a 32-bit integer can occupy is 11: 10 digits plus an optional minus sign
    (local.set $digit_ptr (i32.const 10))

    ;; Only convert the supplied value out of twos-complement if it is flagged as signed and is actually negative
    (if (i32.and (local.get $is_signed) (i32.lt_s (local.get $int_val) (i32.const 0)))
      (then
        ;; Convert to a positive unsigned integer then remember to add a minus sign!
        (local.set $int_val (i32.sub (i32.const 0x80000000) (i32.and (local.get $int_val) (i32.const 0x7FFFFFFF))))
        (local.set $is_negative (i32.const 1))
      )
    )

    ;; Generate the ASCII value of each decimal digit
    (loop $next_digit
      ;; Write the current digit to the output location
      (i32.store8
        (local.get $digit_ptr)
        ;; In the ASCII collation sequence, digits start at 0x30
        (i32.add (i32.const 0x30) (i32.rem_u (local.get $int_val) (i32.const 10)))
      )

      ;; Divide $int_val by 10 (ignoring remainder) and decrement output pointer
      (local.set $int_val (i32.div_u (local.get $int_val) (i32.const 10)))
      (local.set $digit_ptr (i32.sub (local.get $digit_ptr) (i32.const 1)))

      ;; Any digits left?
      (br_if $next_digit (i32.gt_u (local.get $int_val) (i32.const 0)))
    )

    ;; Is a minus sign needed?
    (if (local.get $is_negative)
      (then
        (i32.store8 (local.get $digit_ptr) (global.get $minus_sign))
        (local.set $digit_ptr (i32.sub (local.get $digit_ptr) (i32.const 1)))
      )
    )

    (i32.add (local.get $digit_ptr) (i32.const 1))   ;; Offset
    (i32.sub (i32.const 10) (local.get $digit_ptr))  ;; Length
  )
)
