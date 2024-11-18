/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import { AutoFocusPlugin } from "@lexical/react/LexicalAutoFocusPlugin";
import { CheckListPlugin } from "@lexical/react/LexicalCheckListPlugin";
import { ClearEditorPlugin } from "@lexical/react/LexicalClearEditorPlugin";
import { ClickableLinkPlugin } from "@lexical/react/LexicalClickableLinkPlugin";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { LexicalErrorBoundary } from "@lexical/react/LexicalErrorBoundary";
import { HashtagPlugin } from "@lexical/react/LexicalHashtagPlugin";
import { HorizontalRulePlugin } from "@lexical/react/LexicalHorizontalRulePlugin";
import { ListPlugin } from "@lexical/react/LexicalListPlugin";
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";
import { TabIndentationPlugin } from "@lexical/react/LexicalTabIndentationPlugin";
import { TablePlugin } from "@lexical/react/LexicalTablePlugin";
import { useLexicalEditable } from "@lexical/react/useLexicalEditable";
import { useEffect, useState } from "react";
import AutoLinkPlugin from "./plugins/AutoLinkPlugin";
import CodeActionMenuPlugin from "./plugins/CodeActionMenuPlugin";
import CodeHighlightPlugin from "./plugins/CodeHighlightPlugin";
import ComponentPickerPlugin from "./plugins/ComponentPickerPlugin";
import DragDropPaste from "./plugins/DragDropPastePlugin";
import DraggableBlockPlugin from "./plugins/DraggableBlockPlugin";
import FloatingLinkEditorPlugin from "./plugins/FloatingLinkEditorPlugin";
import FloatingTextFormatToolbarPlugin from "./plugins/FloatingTextFormatToolbarPlugin";
import ImagesPlugin from "./plugins/ImagesPlugin";
import InlineImagePlugin from "./plugins/InlineImagePlugin";
import KeywordsPlugin from "./plugins/KeywordsPlugin";
import { LayoutPlugin } from "./plugins/LayoutPlugin/LayoutPlugin";
import LinkPlugin from "./plugins/LinkPlugin";
import ListMaxIndentLevelPlugin from "./plugins/ListMaxIndentLevelPlugin";
import MarkdownShortcutPlugin from "./plugins/MarkdownShortcutPlugin";
import PageBreakPlugin from "./plugins/PageBreakPlugin";
import ShortcutsPlugin from "./plugins/ShortcutsPlugin";
import TabFocusPlugin from "./plugins/TabFocusPlugin";
import TableCellActionMenuPlugin from "./plugins/TableActionMenuPlugin";
import TableCellResizer from "./plugins/TableCellResizer";
import TableHoverActionsPlugin from "./plugins/TableHoverActionsPlugin";
import ToolbarPlugin from "./plugins/ToolbarPlugin";
import ContentEditable from "./ui/ContentEditable";
import { $generateNodesFromDOM } from "@lexical/html";
import { $getRoot } from "lexical";
import { HistoryPlugin } from "@lexical/react/LexicalHistoryPlugin";

export default function Editor(): JSX.Element {
  const isEditable = useLexicalEditable();

  const [floatingAnchorElem, setFloatingAnchorElem] =
    useState<HTMLDivElement | null>(null);
  const [isSmallWidthViewport, setIsSmallWidthViewport] =
    useState<boolean>(false);
  const [editor] = useLexicalComposerContext();
  const [activeEditor, setActiveEditor] = useState(editor);
  const [isLinkEditMode, setIsLinkEditMode] = useState<boolean>(false);

  const onRef = (_floatingAnchorElem: HTMLDivElement) => {
    if (_floatingAnchorElem !== null) {
      setFloatingAnchorElem(_floatingAnchorElem);
    }
  };
  useEffect(() => {
    const updateViewPortWidth = () => {
      const isNextSmallWidthViewport = window.matchMedia(
        "(max-width: 1025px)"
      ).matches;

      if (isNextSmallWidthViewport !== isSmallWidthViewport) {
        setIsSmallWidthViewport(isNextSmallWidthViewport);
      }
    };
    updateViewPortWidth();
    window.addEventListener("resize", updateViewPortWidth);

    return () => {
      window.removeEventListener("resize", updateViewPortWidth);
    };
  }, [isSmallWidthViewport]);

  return (
    <>
      <ToolbarPlugin
        editor={editor}
        activeEditor={activeEditor}
        setActiveEditor={setActiveEditor}
        setIsLinkEditMode={setIsLinkEditMode}
      />

      <ShortcutsPlugin
        editor={activeEditor}
        setIsLinkEditMode={setIsLinkEditMode}
      />

      <div className={`editor-container`}>
        <DragDropPaste />
        <AutoFocusPlugin />
        <ClearEditorPlugin />
        <ComponentPickerPlugin />
        <HashtagPlugin />
        <KeywordsPlugin />
        <AutoLinkPlugin />
        <RichTextPlugin
          contentEditable={
            <div className="editor-scroller">
              <div className="editor" ref={onRef}>
                <ContentEditable placeholder="<p>Welcome to the editor!</p>" />
              </div>
            </div>
          }
          ErrorBoundary={LexicalErrorBoundary}
        />
        <LoadInitialHtmlPlugin initialHtml={html} />
        <MarkdownShortcutPlugin />
        <CodeHighlightPlugin />
        <ListPlugin />
        <CheckListPlugin />
        <ListMaxIndentLevelPlugin maxDepth={7} />
        <TablePlugin />
        <TableCellResizer />
        <ImagesPlugin />
        <InlineImagePlugin />
        <LinkPlugin />
        {/* // hasLinkAttributes={hasLinkAttributes} */}
        <ClickableLinkPlugin disabled={isEditable} />
        <HorizontalRulePlugin />
        <HistoryPlugin />
        <TabFocusPlugin />
        <TabIndentationPlugin />
        <PageBreakPlugin />
        <LayoutPlugin />
        {floatingAnchorElem && !isSmallWidthViewport && (
          <>
            <DraggableBlockPlugin anchorElem={floatingAnchorElem} />
            <CodeActionMenuPlugin anchorElem={floatingAnchorElem} />
            <FloatingLinkEditorPlugin
              anchorElem={floatingAnchorElem}
              isLinkEditMode={isLinkEditMode}
              setIsLinkEditMode={setIsLinkEditMode}
            />
            <TableCellActionMenuPlugin
              anchorElem={floatingAnchorElem}
              cellMerge={true}
            />
            <TableHoverActionsPlugin anchorElem={floatingAnchorElem} />
            <FloatingTextFormatToolbarPlugin
              anchorElem={floatingAnchorElem}
              setIsLinkEditMode={setIsLinkEditMode}
            />
          </>
        )}
      </div>
    </>
  );
}

// Plugin to load initial HTML
function LoadInitialHtmlPlugin({ initialHtml }: { initialHtml: string }) {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    if (initialHtml) {
      editor.update(() => {
        const parser = new DOMParser();
        const dom = parser.parseFromString(initialHtml, "text/html");
        const nodes = $generateNodesFromDOM(editor, dom);
        const root = $getRoot();
        root.clear(); // Clear existing nodes
        root.append(...nodes); // Append new nodes
      });
    }
  }, [initialHtml, editor]);

  return null;
}

const html = `<hr />
<div style="page-break-after: always"><span style="display:none">&nbsp;</span></div>

<h1 style="text-align:center"><span style="font-family:Arial,Helvetica,sans-serif"><span style="font-size:14px">SERVICES CONTRACT</span></span></h1>

<p><span style="font-family:Arial,Helvetica,sans-serif"><span style="font-size:14px">This outsourcing services contract is entered and agreed upon as of {{_date}} (Effective Date) and takes place between {{sender.first_name}} {{sender.last_name}} residing at {{sender.address}} and {{client.first_name}} {{client.last_name}} residing at {{client.address}}.</span></span></p>

<p><span style="font-family:Arial,Helvetica,sans-serif"><span style="font-size:14px"><strong><span style="color:inherit">Services</span></strong></span></span></p>

<p><span style="font-family:Arial,Helvetica,sans-serif"><span style="font-size:14px">The following deliverables will be provided to the client.</span></span></p>

<table border="1" style="width:100%">
	<tbody>
		<tr>
			<td><span style="font-family:Arial,Helvetica,sans-serif"><span style="font-size:14px">Name</span></span></td>
			<td><span style="font-family:Arial,Helvetica,sans-serif"><span style="font-size:14px">Description</span></span></td>
		</tr>
		<tr>
			<td colspan="2"><span style="font-family:Arial,Helvetica,sans-serif"><span style="font-size:14px">{{#each services }}</span></span></td>
		</tr>
		<tr>
			<td><span style="font-family:Arial,Helvetica,sans-serif"><span style="font-size:14px">{{ name }}</span></span></td>
			<td><span style="font-family:Arial,Helvetica,sans-serif"><span style="font-size:14px">{{ description }}</span></span></td>
		</tr>
		<tr>
			<td colspan="2"><span style="font-family:Arial,Helvetica,sans-serif"><span style="font-size:14px">{{/each}}</span></span></td>
		</tr>
	</tbody>
</table>

<p><span style="font-family:Arial,Helvetica,sans-serif"><span style="font-size:14px">The following deliverables will be provided to the client.<strong>&nbsp;</strong></span></span></p>

<p><span style="font-family:Arial,Helvetica,sans-serif"><span style="font-size:14px"><strong>Deliverables</strong></span></span></p>

<ul>
	<li><span style="font-family:Arial,Helvetica,sans-serif"><span style="font-size:14px">{{#list deliverables}}{{name}}{{/list}}</span></span></li>
</ul>

<p><span style="font-family:Arial,Helvetica,sans-serif"><span style="font-size:14px"><strong>Payment</strong></span></span></p>

<p><span style="font-family:Arial,Helvetica,sans-serif"><span style="font-size:14px">All invoices shall be due on a net-30 basis. Invoice totals are reflected in the table below and include all deposits, retainers, and monthly fees.</span></span></p>

<table border="1" style="width:100%">
	<tbody>
		<tr>
			<td><span style="font-family:Arial,Helvetica,sans-serif"><span style="font-size:14px">Name</span></span></td>
			<td><span style="font-family:Arial,Helvetica,sans-serif"><span style="font-size:14px">Price</span></span></td>
			<td><span style="font-family:Arial,Helvetica,sans-serif"><span style="font-size:14px">Quantity</span></span></td>
			<td><span style="font-family:Arial,Helvetica,sans-serif"><span style="font-size:14px">Subtotal</span></span></td>
		</tr>
		<tr>
			<td colspan="4"><span style="font-family:Arial,Helvetica,sans-serif"><span style="font-size:14px">{{#each payment}}</span></span></td>
		</tr>
		<tr>
			<td><span style="font-family:Arial,Helvetica,sans-serif"><span style="font-size:14px">{{ name }}</span></span></td>
			<td><span style="font-family:Arial,Helvetica,sans-serif"><span style="font-size:14px">$ {{ price }}</span></span></td>
			<td><span style="font-family:Arial,Helvetica,sans-serif"><span style="font-size:14px">{{ quantity }}</span></span></td>
			<td><span style="font-family:Arial,Helvetica,sans-serif"><span style="font-size:14px">$ {{ subtotal }}</span></span></td>
		</tr>
		<tr>
			<td colspan="4"><span style="font-family:Arial,Helvetica,sans-serif"><span style="font-size:14px">{{/each}}</span></span></td>
		</tr>
	</tbody>
</table>

<p><span style="font-family:Arial,Helvetica,sans-serif"><span style="font-size:14px"><strong>Terms and Conditions</strong></span></span></p>

<p><span style="font-family:Arial,Helvetica,sans-serif"><span style="font-size:14px">Retained Rights. Each party will retain all right, title, and interest in and to its own Pre‐Existing Intellectual Property irrespective of any disclosure of such Pre‐Existing Intellectual Property to the other party, subject to any licenses granted herein.</span></span></p>

<ul>
	<li><span style="font-family:Arial,Helvetica,sans-serif"><span style="font-size:14px">Pre‐Existing Intellectual Property.</span></span></li>
</ul>

<ul>
	<li><span style="font-family:Arial,Helvetica,sans-serif"><span style="font-size:14px">Service provider will not use any third party Pre‐Existing Intellectual Property in connection with this Contract unless Provider has the right to use it for Customer’s benefit. If Provider is not the owner of such Pre‐Existing Intellectual Property, Provider will obtain from the owner any rights as are necessary to enable Service Provider to comply with this Contract.</span></span></li>
</ul>

<ul>
	<li><span style="font-family:Arial,Helvetica,sans-serif"><span style="font-size:14px">Service Provider grants Client a non‐exclusive, royalty‐free, worldwide, perpetual and irrevocable license Pre‐Existing Intellectual Property, to the extent such Pre‐Existing Intellectual Property is incorporated into any Deliverable, with the license including the right to make, have made, sell, use, reproduce, modify, adapt, display, distribute, make other versions of and disclose the property and to sublicense others to do these things.</span></span></li>
</ul>

<ul>
	<li><span style="font-family:Arial,Helvetica,sans-serif"><span style="font-size:14px">Service Provider will not incorporate any materials from a third party, including Open Source or freeware, into any Deliverable unless (i) Provider clearly identifies the specific elements of the Deliverable to contain third party materials, (ii) Provider identifies the corresponding third party licenses and any restrictions on use thereof, and (ii) approval is given by Customer in writing. Service Provider represents, warrants and covenants compliance and shall continue to comply with all third party licenses (including all open source licenses) associated with any software components that will be included in the Deliverables or any other materials supplied under this services contract.</span></span></li>
</ul>

<ul>
	<li><span style="font-family:Arial,Helvetica,sans-serif"><span style="font-size:14px">Ownership of Deliverables.&nbsp;Subject to Provider and third party rights in Pre‐Existing Intellectual Property, all Deliverables,despite status are property of client. Service Provider agrees that client will own all patents, inventor’s certificates, utility models or other rights, copyrights or trade secrets covering the Deliverables and will have full rights to use the Deliverables without claim for additional compensation and without challenge, opposition or interference by said Provider and will cause each of its Personnel to, waive their respective moral rights therein. Provider will sign any necessary documents and will otherwise assist Customer in securing, maintaining and defending copyrights or other rights to protect the Deliverables in any country.</span></span></li>
</ul>

<ul>
	<li><span style="font-family:Arial,Helvetica,sans-serif"><span style="font-size:14px">No Rights to Customer Intellectual Property.&nbsp;Except for the limited license to use materials provided by Customer as may be necessary in order for Service Providerto perform Services under this Contract, Provider is granted no right, title, or interest in any Customer Intellectual Property.</span></span></li>
</ul>

<ul>
	<li><span style="font-family:Arial,Helvetica,sans-serif"><span style="font-size:14px">Confidential Information.&nbsp;For purposes of this Contract, “Confidential Information” shall mean information or material proprietary to a Party or designated as confidential by such Party (the “Disclosing Party”), as well as information about which a Party (the “Receiving Party”) obtains knowledge or access, through or as a result of this Contract (including information conceived, originated, discovered or developed in whole or in part by Service Provider hereunder). Confidential Information does not include: a) information that is or becomes publicly known without restriction and without breach of this Contract or that is generally employed by the trade at or after the time the Receiving Party first learns of such information; b) generic information or knowledge which the Receiving Party would have learned in the course of similar employment or work elsewhere in the trade; c) information the Receiving Party lawfully receives from a third party without restriction on disclosure and without breach of a nondisclosure obligation; d) information the Receiving Party rightfully knew prior to receiving such information from the Disclosing Party to the extent such knowledge was not subject to restrictions on further disclosure; or (e) information the Receiving Party develops independent of any information originating from the Disclosing Party.</span></span></li>
</ul>

<ul>
	<li><span style="font-family:Arial,Helvetica,sans-serif"><span style="font-size:14px">Customer Confidential Information.&nbsp;The following constitute Confidential Information of Customer and should not be disclosed to third parties: the Deliverables, discoveries, ideas, concepts, software in various states of development, designs, drawings, specifications, techniques, models, data, source code, source files and documentation, object code, documentation, diagrams, flow charts, research, development, processes, procedures, “know-how”, marketing techniques and materials, marketing and development plans, customer names and other information related to customers, price lists, pricing policies and financial information, this Contract and the existence of this Contract, and any work assignments authorized or issued under this Contract. Service Provider will not use Customer’s name, likeness, or logo (Customer’s “Identity”), without Customer’s prior written consent, to include use or reference to Customer’s Identity, directly or indirectly, in conjunction with any other clients or potential clients, any client lists, advertisements, news releases or releases to any professional or trade publications.</span></span></li>
</ul>

<ul>
	<li><span style="font-family:Arial,Helvetica,sans-serif"><span style="font-size:14px">Non-Disclosure.&nbsp;The Parties hereby agree that during the term hereof and at all times thereafter, and except as specifically permitted herein or in a separate writing signed by the Disclosing Party, the Receiving Party shall not use, commercialize or disclose Confidential Information to any person or entity. Upon termination, or at any time upon the request of the Disclosing Party, the Receiving Party shall return to the Disclosing Party all Confidential Information, including all notes, data, reference materials, sketches, drawings, memorandums, documentations and records which in any way incorporate Confidential Information.</span></span></li>
</ul>

<ul>
	<li><span style="font-family:Arial,Helvetica,sans-serif"><span style="font-size:14px">Right to Disclose.&nbsp;With respect to any information, knowledge, or data disclosed to Customer by the Service Provider the Freelancer warrants that the Freelancer has full and unrestricted right to disclose the same without incurring legal liability to others, and that Customer shall have full and unrestricted right to use and publish the same as it may see fit. Any restrictions on Customer’s use of any information, knowledge, or data disclosed by Provider must be made known to Customer as soon as practicable and in any event agreed upon before the start of any work.</span></span></li>
</ul>

<ul>
	<li><span style="font-family:Arial,Helvetica,sans-serif"><span style="font-size:14px">Service Provider represents that its execution and performance of this Contract does not conflict with or breach any contractual,other obligations in which provider is committed too. Service Provider shall not accept any work from Customer or work from any other business organizations or entities which would create an actual or potential conflict of interest for the Provider or which is detrimental to Customer’s business interests.</span></span></li>
</ul>

<ul>
	<li><span style="font-family:Arial,Helvetica,sans-serif"><span style="font-size:14px">Customer may terminate this Contract and/or an individual project for its convenience, without liability at any time, upon prior written notice to Service Provider.</span></span></li>
</ul>

<ul>
	<li><span style="font-family:Arial,Helvetica,sans-serif"><span style="font-size:14px">Service Provider may terminate this Contract upon [Days] prior written notice provided there are no deliverables in progress during that period.</span></span></li>
</ul>

<ul>
	<li><span style="font-family:Arial,Helvetica,sans-serif"><span style="font-size:14px">Customer may terminate this Contract and/or any open projects immediately for cause if the Provider fails to perform any of its obligations under this Contract or if a breach of any the warranties provided herein and fails to correct such failure or breach to Customer’s reasonable satisfaction within ten (10) calendar days (unless extended by Customer) following notice by Customer. Customer shall be entitled to seek and obtain all remedies available to it in law or in equity</span></span></li>
</ul>

<ul>
	<li><span style="font-family:Arial,Helvetica,sans-serif"><span style="font-size:14px">Upon termination of any project or work given Service Provider hereunder, Provider will immediately provide Customer with any and all work in progress or completed prior to the termination date. As Customer’s sole obligation to Provider resulting from such termination, Customer will pay an equitable amount as determined by Customer for the partially completed work in progress and the agreed to price for the completed Services and/or Deliverables provided and accepted prior to the date of termination</span></span></li>
</ul>

<ul>
	<li><span style="font-family:Arial,Helvetica,sans-serif"><span style="font-size:14px">Upon termination or expiration of this Contract or a project performed by Service Provider hereunder, whichever occurs first, Provider shall promptly return to Customer all materials and or tools provided by Customer under this Contract and all Confidential Information provided by Customer.</span></span></li>
</ul>

<ul>
	<li><span style="font-family:Arial,Helvetica,sans-serif"><span style="font-size:14px">Any provision or clause in this Contract that, by its language or context, implies its survival shall survive any termination or expiration of this Contract.</span></span></li>
</ul>

<ul>
	<li><span style="font-family:Arial,Helvetica,sans-serif"><span style="font-size:14px">Service Provider warrants that:</span></span></li>
</ul>

<ul>
	<li><span style="font-family:Arial,Helvetica,sans-serif"><span style="font-size:14px">the Services and Deliverables are original and do not infringe upon any third party’s patents, trademarks, trade secrets, copyrights or other proprietary rights,</span></span></li>
</ul>

<ul>
	<li><span style="font-family:Arial,Helvetica,sans-serif"><span style="font-size:14px">it will perform the Services hereunder in a professional and workmanlike manner,</span></span></li>
</ul>

<ul>
	<li><span style="font-family:Arial,Helvetica,sans-serif"><span style="font-size:14px">the Deliverable provided to Customer are new, of acceptable quality free from defects in material and workmanship and will meet the requirements and conform with any specifications agreed between the parties,</span></span></li>
</ul>

<ul>
	<li><span style="font-family:Arial,Helvetica,sans-serif"><span style="font-size:14px">it has all necessary permits and is authorized to do business in all jurisdictions where Services are to be performed,</span></span></li>
</ul>

<ul>
	<li><span style="font-family:Arial,Helvetica,sans-serif"><span style="font-size:14px">it will comply with all applicable federal and other jurisdictional laws in performing the Services,</span></span></li>
</ul>

<ul>
	<li><span style="font-family:Arial,Helvetica,sans-serif"><span style="font-size:14px">it has all rights to enter into this Contract and there are no impediments to the ability of execution of this Contract.</span></span></li>
</ul>
`;
