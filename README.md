#prefix.js
Auto add prefix for css attribute if the gaven prototype is not supported.

> Write less, Fit more

This plugin is a CSS pre-processor, it works for the compatibility among so many different browser engines. **prefix.js** will auto amend gaven prototype and attribute for current engines.

The **prefix.min.js** is only 3KB.
 
###Example

##1.Auto detecting

```css
div{
    transform: scale(1.0,1.0)
}
```

If we run this code in Safari , and `transform` is not supported in some older versions, **prefix.js** will trying to test whether if `-webkit-transform` is supported and using it when it is.

##2.Media and Keyframes supported

###Media

```css
@media screen and (max-width: 900px){
    
}
```

In this code , `max-width` maybe need to be `-webkit-max-width` etc.

###Keyframes

```css
@keyframes cartoon{
    from{
        transform: translateX(100px);
    }
    to{
        transform: translateX(0px);
    }
}
```

`@keyframes` also maybe need to be `@-webkit-keyframes` etc, so we could write less than below code.

```css
@-webkit-keyframes cartoon{
    from{
        -webkit-transform: translateX(100px);
    }
    to{
        -webkit-transform: translateX(0px);
    }
}
@-moz-keyframes cartoon{
    from{
        -moz-transform: translateX(100px);
    }
    to{
        -moz-transform: translateX(0px);
    }
}
@-ms-keyframes cartoon{
    from{
        -ms-transform: translateX(100px);
    }
    to{
        -ms-transform: translateX(0px);
    }
}
@-o-keyframes cartoon{
    from{
        -o-transform: translateX(100px);
    }
    to{
        -o-transform: translateX(0px);
    }
}
@keyframes cartoon{
    from{
        transform: translateX(100px);
    }
    to{
        transform: translateX(0px);
    }
}
```

See? **prefix.js** is amazing!

##Usage

```html
<script src="prefix.js"></script>
```

Add attribute `format="format"` on script so you can get a formatted style code.

Or you can use **prefix.js** with `require`, you can call `require("prefix.js").init(format)` while the page is initializing.


