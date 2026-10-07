import * as React from "react";

/*
 * **Nine names added for the apps, and the guard grew to make that legal** (`PD-656`, `N-6`).
 *
 * `Archive`, `ArrowDown`, `ArrowUp`, `Camera`, `Clock`, `Location`, `MoreVertical`, `Star` and
 * `Team`. Every one was being imported straight from `@radix-ui/react-icons` by application code,
 * which item 11 forbids and `check:icons` could not see, because its walk stopped at
 * `packages/web/ui/react/src`. Twenty-eight more were **already here** under a semantic name and the
 * app was reaching past them to Radix's.
 *
 * **They could not simply be added.** Assertion 3 removes a slot name no component imports, and its
 * `importedNames` was built from the package alone, so a name the apps need and the package does not
 * would have been reported as dead weight. Extending the walk to the apps is what makes both ends
 * work at once: the direct imports become findable and app usage counts as usage.
 *
 * **Eleven more for the free edition**, which had never routed through here at all: `Reload`,
 * `Desktop`, `Video`, `PaperPlane`, `Rocket`, `Picture`, `MailOpen`, `Bolt`, `Cursor`, `Logout` and
 * `ArrowDownRight`. `Picture` rather than `Image`, deliberately, because a page importing Next's
 * `Image` beside it would collide on the name and the error would be at the call site rather than
 * here.
 *
 * `Clock` and `Star` sit beside `marks.tsx`' own `ClockIcon` and `StarIcon`, which are different
 * drawings for the same idea (`PD-652` counts five such pairs). The names not colliding is not the
 * same as the duplication being resolved; that is `N-11`, and the dev has deferred it.
 */
/**
 * The icon slot: the one place this package names an icon set (`X-1`).
 *
 * **Why this file exists.** The product is sold on breadth of configuration, and until now every
 * axis had exactly one implementation. Icons were the cheapest to open and the one a buyer notices
 * first: sixteen files under `packages/web/ui/react/src` imported `@radix-ui/react-icons` directly, so
 * "use Lucide instead" meant editing sixteen files and knowing which of Radix's forty-one names
 * mapped to which of Lucide's.
 *
 * Now it means editing this one. `scripts/check-icons.mjs` keeps it that way.
 *
 * ## The names are semantic, not Radix's
 *
 * `Close` rather than `Cross2Icon`, `Warning` rather than `ExclamationTriangleIcon`, `Spinner`
 * rather than `UpdateIcon`. A set-shaped API would have made this file a rename of Radix, and the
 * next person's binding a translation of a translation. What a component asks for is the *meaning*,
 * and each set answers it in its own vocabulary.
 *
 * ## One binding, and that is the decision (`PD-302`)
 *
 * `icons-lucide.tsx` used to sit beside this file, binding the same names to Lucide so the swap was
 * demonstrated rather than claimed. It is gone. It worked and it cost more than it proved: the guard
 * held both files to identical name lists, so **adding one glyph meant drawing it twice**, and a
 * name Lucide had no equivalent for became a judgement about meaning before a page could use a mark.
 * Thirteen marks ended up in application page code for that reason. The axis is unchanged; the
 * maintenance moved to whoever wants the second set.
 *
 * ## Sizing is part of the contract, and it is not free
 *
 * Every Radix icon is 15x15, and `theme.css` gives the icon chip to `svg[width="15"], .vui-icon`.
 * A set that draws at 24x24 with strokes rather than filled paths is not a pure rename: it has to
 * opt into `.vui-icon` and set its own size. That is the documented escape hatch and the reason the
 * selector was written with two arms in the first place. Anyone writing a second binding starts
 * there.
 */
/**
 * The map marker, drawn here because the set does not have one (`PD-339`).
 *
 * **The same path as `DEMO_ICON_DRAWN`'s**, on the same 15x15 grid, so React and every other edition
 * render the identical glyph. Two copies of one path is the shape this repo keeps finding drifted, so
 * `map-pin-parity.test.ts` compares them and goes red if they part company.
 *
 * `width`/`height` of 15 rather than a class, because `theme.css` gives the icon chip to
 * `svg[width="15"]` and a marker drawn without them would be the one sidebar glyph outside the rule.
 */
export const Pin = React.forwardRef<SVGSVGElement, React.SVGProps<SVGSVGElement>>(
  function Pin(props, ref) {
    return (
      <svg ref={ref} width="15" height="15" viewBox="0 0 15 15" fill="none" {...props}>
        <path
          d="M7.5 1C4.87665 1 2.75 3.12665 2.75 5.75C2.75 8.0625 5.0625 11.1875 7.5 14C9.9375 11.1875 12.25 8.0625 12.25 5.75C12.25 3.12665 10.1234 1 7.5 1ZM7.5 7.5C6.5335 7.5 5.75 6.7165 5.75 5.75C5.75 4.7835 6.5335 4 7.5 4C8.4665 4 9.25 4.7835 9.25 5.75C9.25 6.7165 8.4665 7.5 7.5 7.5Z"
          fill="currentColor"
          fillRule="evenodd"
          clipRule="evenodd"
        />
      </svg>
    );
  },
);

export {
  ArchiveIcon as Archive,
  ArrowBottomRightIcon as ArrowDownRight,
  ArrowDownIcon as ArrowDown,
  ArrowLeftIcon as ArrowLeft,
  ArrowRightIcon as ArrowRight,
  ArrowTopRightIcon as ArrowUpRight,
  ArrowUpIcon as ArrowUp,
  AvatarIcon as Avatar,
  BackpackIcon as Backpack,
  BackpackIcon as Team,
  BarChartIcon as BarChart,
  BellIcon as Bell,
  BookmarkIcon as Bookmark,
  BoxIcon as Box,
  CalendarIcon as Calendar,
  CameraIcon as Camera,
  CaretDownIcon as CaretDown,
  CaretSortIcon as CaretSort,
  CaretUpIcon as CaretUp,
  ChatBubbleIcon as ChatBubble,
  CheckCircledIcon as CheckCircle,
  CheckIcon as Check,
  ChevronDownIcon as ChevronDown,
  ChevronLeftIcon as ChevronLeft,
  ChevronRightIcon as ChevronRight,
  CircleIcon as Circle,
  ClockIcon as Clock,
  CodeIcon as Code,
  ColorWheelIcon as Palette,
  CopyIcon as Copy,
  Cross2Icon as Close,
  CrossCircledIcon as CloseCircle,
  CubeIcon as Cube,
  CursorArrowIcon as Cursor,
  DashboardIcon as Dashboard,
  DesktopIcon as Desktop,
  DotFilledIcon as Dot,
  DotsHorizontalIcon as MoreHorizontal,
  DotsVerticalIcon as MoreVertical,
  DownloadIcon as Download,
  DragHandleDots2Icon as DragHandle,
  EnterIcon as Enter,
  EnvelopeClosedIcon as Mail,
  EnvelopeOpenIcon as MailOpen,
  ExclamationTriangleIcon as Warning,
  ExitIcon as Logout,
  EyeNoneIcon as EyeOff,
  EyeOpenIcon as Eye,
  FileIcon as File,
  FileTextIcon as FileText,
  GearIcon as Settings,
  GlobeIcon as Globe,
  HamburgerMenuIcon as Menu,
  HomeIcon as Home,
  IdCardIcon as IdCard,
  ImageIcon as Picture,
  InfoCircledIcon as Info,
  InputIcon as Input,
  LayoutIcon as Layout,
  LightningBoltIcon as Bolt,
  LockClosedIcon as Lock,
  MagicWandIcon as Wand,
  MagnifyingGlassIcon as Search,
  MinusIcon as Minus,
  MixerHorizontalIcon as Sliders,
  MixIcon as Mix,
  MobileIcon as Mobile,
  MoonIcon as Moon,
  PaperPlaneIcon as PaperPlane,
  Pencil1Icon as Edit,
  Pencil2Icon as Compose,
  PersonIcon as Person,
  PlayIcon as Play,
  PlusIcon as Plus,
  QuestionMarkCircledIcon as Help,
  ReaderIcon as Reader,
  ReloadIcon as Reload,
  ResetIcon as Reset,
  RocketIcon as Rocket,
  RowsIcon as Rows,
  RulerHorizontalIcon as Ruler,
  SewingPinFilledIcon as Location,
  Share2Icon as Share,
  StarIcon as Star,
  SunIcon as Sun,
  TableIcon as Table,
  TargetIcon as Target,
  TextAlignLeftIcon as AlignLeft,
  TextIcon as Text,
  TokensIcon as Tokens,
  TrashIcon as Trash,
  UpdateIcon as Spinner,
  UploadIcon as Upload,
  VideoIcon as Video,
} from "@radix-ui/react-icons";
